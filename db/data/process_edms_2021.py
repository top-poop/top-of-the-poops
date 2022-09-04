#!/usr/bin/env python3

import argparse
import csv
import os
import re

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


def ensure_zero_if_empty(thing):
    if thing == "":
        thing = 0
    return float(thing)


def ensure_is_percentage(thing):
    if thing > 1:
        thing /= 100.0
    return thing


def epr_consent(company, provided):

    if company == "Wessex Water":
        if re.match(r"^\d{5}$", provided):
            provided = f"0{provided}"

    if provided.startswith("EPR"):
        provided = "".join(provided.split("/"))
    return provided


def write_row(writer, row):
    if len(row) != 11:
        raise IOError(f"bodge was wrong, got {row}")

    writer.writerow(row)


def bodge(row):
    return 2021, row[0], row[1], \
           epr_consent(row[0], row[3]), row[5], \
           ensure_bathing_or_shellfish(row[11]), ensure_bathing_or_shellfish(row[12]), \
           ensure_numeric_or_empty(row[14]), \
           ensure_numeric_or_empty(row[15]), \
           ensure_is_percentage(ensure_zero_if_empty(ensure_numeric_or_empty(row[16]))), " ".join(row[17:21]).strip()


if __name__ == "__main__":

    parser = argparse.ArgumentParser(description="process EDM 2021 files")

    parser.add_argument("output", help="output file")
    parser.add_argument("input", nargs="+", help="inputs")

    args = parser.parse_args()

    try:
        with open(args.output, "w") as out:
            writer = csv.writer(out)
            writer.writerow(
                ["reporting_year", "company", "site", "permit", "activity_reference", "is_shellfishery",
                 "is_bathing_beach",
                 "spill_duration",
                 "spill_count", "reporting_coverage_pct", "comments"]
            )

            for edm in filter(lambda n: n.endswith(".csv"), args.input):
                seen = set()
                with open(edm, encoding='windows-1252') as edm_file:
                    sewage = csv.reader(edm_file)
                    next(sewage)
                    next(sewage)

                    for line in sewage:
                        bodged = bodge(line)

                        s = "".join(str(b) for b in bodged)
                        if s in seen:
                            print(f"Duplicate row: {bodged}")
                        else:
                            seen.add(s)
                            write_row(writer, bodged)
    except Exception as e:
        os.unlink(args.output)
        raise e from None
