#!/usr/bin/env python3

import argparse
import csv
import os
import re


# Data Quality - just like water quality! - is very poor
# Each file is just _slightly_ different from each other file
# some have _ in the name, some have [space], some are "Return", some "Returns"
# some have a blank first field, some have extra at the end.
# some have % in the percentages, some not
# some format hours as floats, some as hh:mm:ss

def southern_water(row):
    # has random extra duplicated fields
    return row[0:1] + row[2:3] + row[4:]


def anglian_water(row):
    # has extra (blank) field at start
    return row[1:]


def thames_water(row):
    # has extra field at end
    return row[:-1]


def united_utilities(row):
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
    return row


bodges = {
    "Thames Water": thames_water,
    "Anglian_Water": anglian_water,
    "Southern_Water": southern_water,
    "United_Utilities": united_utilities,
    "Northumbrian_Water": northumbrian_water,
}


def write_row(writer, row):
    if len(row) != 10:
        raise IOError(f"bodge was wrong, got {row}")

    writer.writerow(bodged)


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

    args = parser.parse_args()

    os.chdir(args.directory)

    with open("standardised-returns.csv", "w") as out:
        writer = csv.writer(out)
        writer.writerow(
            ["company", "site", "permit", "activity_reference", "is_shellfishery", "is_bathing_beach", "spill_duration",
             "spill_count", "reporting_coverage_pct", "comments"])
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
                    bodged[8] = bodged[8].replace("%", "")

                    bodged[4] = ensure_not_na(bodged[4])
                    bodged[5] = ensure_not_na(bodged[5])

                    # some records are "n/a" or similar
                    bodged[6] = ensure_numeric(bodged[6])
                    bodged[7] = ensure_numeric(bodged[7])
                    bodged[8] = ensure_numeric(bodged[8])

                    write_row(writer, bodged)
