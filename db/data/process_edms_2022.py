#!/usr/bin/env python3

import argparse
import csv
import os
import re

from edm_types import EDM, edm_writer

nas = {"n/a", "#n/a", "#na"}


def ensure_not_na(thing):
    if thing.lower() in nas:
        return ""
    return thing


def ensure_bathing_or_shellfish(thing):
    thing = ensure_not_na(thing)
    if thing == '0':
        return ""
    return thing


def ensure_numeric_or_empty(thing):
    thing = thing.strip()
    thing = ensure_not_na(thing)
    if thing == "-":
        thing = ""
    return thing


def ensure_numeric(thing):
    thing = thing.strip()
    thing = ensure_not_na(thing)
    if thing in ("-", ""):
        thing = 0
    thing = round(float(thing), 3)
    return thing


def ensure_zero_if_empty(thing):
    if thing == "":
        thing = 0
    return float(thing)


def ensure_is_percentage(thing):
    if thing > 1:
        thing /= 100.0
    return round(thing, 3)


def epr_consent(company, provided):
    if company == "Wessex Water":
        if re.match(r"^\d{5}$", provided):
            provided = f"0{provided}"

    if provided.startswith("EPR"):
        provided = "".join(provided.split("/"))
    return provided


def ensure_grid_reference(grid_reference):
    potential = grid_reference.replace(" ", "").split("/")[0]
    if potential == "FALSE":
        return ""
    return potential


def ensure_waterbody_id(maybe_waterbody_id: str):
    if maybe_waterbody_id.startswith("GB"):
        return maybe_waterbody_id
    else:
        return None


def bodge(row):
    return EDM(
        reporting_year=2022,
        company_name=row[0].replace("\\n", ""),
        site_name=row[1].replace("\\n", ""),
        wasc_site_name=row[2].replace("\\n", ""),
        consent_id=epr_consent(row[0], row[3]),
        activity_reference=row[5],
        shellfishery=ensure_bathing_or_shellfish(row[11]).replace("\\n", ""),
        bathing=ensure_bathing_or_shellfish(row[12]).replace("\\n", ""),
        total_spill_hours=ensure_numeric(row[15]),
        spill_count=int(ensure_numeric(row[16])),
        reporting_pct=ensure_is_percentage(ensure_zero_if_empty(ensure_numeric_or_empty(row[19]))),
        wfd_waterbody_id=ensure_waterbody_id(row[8]),
        excuses=" ".join(row[28:]).strip(),
        edm_commissioning_info=row[14],
        reporting_low_reason=row[20],
        reporting_low_action=row[21],
        spill_high_reason=row[22],
        spill_high_action=row[23].replace("â€“", "-"),
        spill_high_planning=row[24]
    )


if __name__ == "__main__":

    parser = argparse.ArgumentParser(description="process EDM 2021 files")

    parser.add_argument("output", help="output file")
    parser.add_argument("input", nargs="+", help="inputs")

    args = parser.parse_args()

    try:
        with edm_writer(args.output) as writer:
            for edm in filter(lambda n: n.endswith(".csv"), args.input):
                seen = set()
                with open(edm, encoding='windows-1252') as edm_file:
                    sewage = csv.reader(edm_file)
                    next(sewage)
                    next(sewage)

                    for line in sewage:
                        bodged = bodge(line)

                        if bodged.site_name in ("FALSE", "Not in Consents Database"):
                            continue

                        s = str(bodged)
                        if s in seen:
                            print(f"Duplicate row: {bodged}")
                        else:
                            seen.add(s)
                            if bodged.company_name != "":
                                writer(bodged)
    except Exception as e:
        os.unlink(args.output)
        raise e from None
