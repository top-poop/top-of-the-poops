#!/usr/bin/env python3

import argparse
import csv
import os
import re

from edm_types import edm_writer, EDM
from process_edms_2021 import ensure_is_percentage, ensure_zero_if_empty, ensure_numeric_or_empty


# Data Quality - just like water quality! - is very poor
# Each file is just _slightly_ different from each other file
# some have _ in the name, some have [space], some are "Return", some "Returns"
# some have a blank first field, some have extra at the end.
# some have % in the percentages, some not
# some format hours as floats, some as hh:mm:ss

def epr_consent(provided):
    if provided.startswith("EPR"):
        provided = "".join(provided.split("/"))
    return provided


def southern_water(row):
    # has random extra duplicated fields, field permit number doesn't relate to anything,
    # use 'folio' instead.
    standard = row[0:1] + row[2:3] + row[4:]
    standard[2] = epr_consent(standard[10])
    return standard


def anglian_water_consent(provided):
    provided = re.sub(r"v(\d+)$", r"/V\1", provided)
    provided = "/".join([p for p in provided.split("/") if not re.search(r"[vV]\d+", p)])

    if provided.startswith("EPR"):
        provided = "".join(provided.split("/"))
    else:
        stem, *others = provided.split("/")
        if others:
            stem = provided[:5]
            provided = stem + others[-1]

        if re.search(r"[a-zA-Z]$", provided):
            provided = provided[:-1]

    return provided


def test_anglian_water_consent():
    # Anglian looks like ANNNF3244/13375/V001 or AW1NF2723v002 or AW1NF947/V001 or EPR/NB3993AQ/V001 or EPR/CB3597EV
    assert anglian_water_consent("AW1NF2723v002") == "AW1NF2723"
    assert anglian_water_consent("EPR/NB3993AQ/V001") == "EPRNB3993AQ"
    assert anglian_water_consent("EPR/CB3597EV") == "EPRCB3597EV"
    assert anglian_water_consent("ANNNF3244/13375/V001") == "ANNNF13375"
    assert anglian_water_consent("AW1NF947/V001") == "AW1NF947"
    assert anglian_water_consent("ANNNF1192C") == "ANNNF1192"


def anglian_water(row):
    # has extra (blank) field at start
    row = row[1:]
    row[2] = anglian_water_consent(row[2])

    return row


def thames_water(row):
    # has extra field at end
    standard = row[:-1]
    standard[2] = epr_consent(standard[2])
    return standard


def united_utilities(row):

    # permit number in different place
    row[2] = row[10]


    # spill hours as hh:mm:ss
    match = re.search(r"(\d+):(\d+):(\d+)", row[6])
    total = 0.0
    if match:
        hours, mins, seconds = [int(n) for n in match.groups()]
        total = hours + (mins / 60) + (seconds / (60 * 60))
    row[6] = total

    return row


def northumbrian_water(row):
    # bundles multiple numbers into single value field reporting_pct
    row[8] = str(min([float(x.replace("%", "")) for x in row[8].split("/")]))
    row[2] = epr_consent(row[2])
    return row


def wessex_water(row):
    row[2] = epr_consent(row[2])
    return row


def south_west_water(row):
    row[2] = epr_consent(row[2])
    return row


def yorkshire_water(row):
    row[2] = epr_consent(row[2])
    if row[8] in ["N/A Digital Point Only", "Not available"]:
        row[8] = "0"
    return row


def welsh_water(row):
    row[2] = epr_consent(row[2])
    return row


bodges = {
    "Thames Water": thames_water,
    "Anglian_Water": anglian_water,
    "Southern_Water": southern_water,
    "United_Utilities": united_utilities,
    "Northumbrian_Water": northumbrian_water,
    "Wessex_Water": wessex_water,
    "South_West_Water": south_west_water,
    "Yorkshire_Water": yorkshire_water,
    "Dwr_Cymru_Welsh_Water": welsh_water,
}


def write_row(writer, row):
    if len(row) != 11:
        raise IOError(f"bodge was wrong, got {row}")

    writer.writerow(row)


def ensure_numeric(thing):
    try:
        return round(float(thing), 2)
    except:
        return 0.0


def ensure_not_na(thing):
    if thing.lower() == "n/a":
        return ""
    return thing


if __name__ == "__main__":

    parser = argparse.ArgumentParser(description="process mess of EDM files")

    parser.add_argument("directory", default=".", help="directory")
    parser.add_argument("output", default=".", help="file")

    args = parser.parse_args()

    with edm_writer(args.output) as writer:

        os.chdir(args.directory)

        for filename in [f for f in os.listdir() if f.startswith("EAv") and f.endswith(".csv") and not "Summary" in f]:
            print(f"Processing {filename}")

            who = re.search(r'Returns?[ _]([\w ]+)[ _]Annual', filename).group(1)
            bodge = bodges.get(who, lambda row: row)

            with open(filename, encoding='windows-1252') as csvfile:
                sewage = csv.reader(csvfile)
                next(sewage)

                for discharge in sewage:
                    discharge = [s.strip() for s in discharge]
                    bodged = bodge(discharge)

                    # various records have multiple comments at end
                    comment = " ".join(bodged[9:]).strip()
                    del bodged[10:]
                    bodged[9] = comment

                    # various have % or not
                    bodged[8] = ensure_is_percentage(ensure_zero_if_empty(ensure_numeric_or_empty(bodged[8].replace("%", ""))))

                    bodged[4] = ensure_not_na(bodged[4])
                    bodged[5] = ensure_not_na(bodged[5])

                    # some records are "n/a" or similar
                    bodged[6] = ensure_numeric(bodged[6])
                    bodged[7] = ensure_numeric(bodged[7])
                    bodged[8] = ensure_numeric(bodged[8])

                    edm = EDM(
                        reporting_year=2020,
                        company_name=bodged[0],
                        site_name=bodged[1],
                        consent_id=bodged[2],
                        activity_reference=bodged[3],
                        shellfishery=bodged[4],
                        bathing=bodged[5],
                        total_spill_hours=bodged[6],
                        spill_count=bodged[7],
                        reporting_pct=bodged[8],
                        excuses=bodged[9],
                        wfd_waterbody_id=None,
                        wasc_site_name=bodged[1],
                        # grid_reference="",
                        edm_commissioning_info="",
                        reporting_low_reason="",
                        reporting_low_action="",
                        spill_high_reason="",
                        spill_high_action="",
                        spill_high_planning=""
                    )

                    writer(edm)
