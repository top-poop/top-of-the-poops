#!/usr/bin/env python3

import argparse
import csv
import os

nas = {"n/a", "#n/a", "#na"}


def ensure_not_na(thing):
    if thing.lower() in nas:
        return ""
    return thing


def ensure_numeric(thing):
    thing = thing.strip()
    thing = ensure_not_na(thing)
    if thing == "-":
        thing = ""
    return thing


def epr_consent(provided):
    if provided.startswith("EPR"):
        provided = "".join(provided.split("/"))
    return provided


def write_row(writer, row):
    if len(row) != 11:
        raise IOError(f"bodge was wrong, got {row}")

    writer.writerow(row)


def bodge(row):
    return 2021, row[0], row[1], \
           epr_consent(row[3]), row[5], \
           ensure_not_na(row[11]), ensure_not_na(row[12]), \
           ensure_numeric(row[14]), \
           ensure_numeric(row[15]), \
           ensure_numeric(row[16]), " ".join(row[17:21]).strip()


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
                with open(edm) as edm_file:
                    sewage = csv.reader(edm_file)
                    next(sewage)
                    next(sewage)

                    for line in sewage:
                        bodged = bodge(line)

                        write_row(writer, bodged)
    except Exception as e:
        os.unlink(args.output)
        raise e from None
