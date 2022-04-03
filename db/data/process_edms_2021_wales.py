#!/usr/bin/python
import argparse
import csv
import itertools
import os

from process_consents_wales import EDM, WELSH_WATER
from process_edms_2021 import ensure_zero_if_empty, ensure_numeric_or_empty

def reading_csv(filepath, skip=0):
    with open(filepath) as fp:
        reader = csv.reader(fp)
        if skip > 0:
            for i in range(1, skip):
                next(reader)
        for dump in reader:
            yield dump


def parse_storm_edms(filepath):
    # this is a csv file, starting on line 13
    edms = []
    for dump in reading_csv(filepath, skip=12):
        edms.append(EDM(
            2021,
            dump[0],
            dump[1] if dump[1].strip() not in ("", "#TBC") else dump[2],
            dump[3] if dump[3].strip().lower() != "#n/a" else "Unpermitted",
            dump[5],
            dump[11],
            dump[12],
            ensure_zero_if_empty(ensure_numeric_or_empty(dump[14])),
            ensure_zero_if_empty(ensure_numeric_or_empty(dump[15])),
            ensure_zero_if_empty(ensure_numeric_or_empty(dump[16])),
            " ".join(dump[17:]).strip()
        ))
    return edms


def parse_emergency_edms(filepath):
    edms = []
    for dump in reading_csv(filepath, skip=14):
        edms.append(EDM(
            2021,
            dump[0],
            dump[1] if dump[1].strip() not in ("", "#TBC") else dump[2],
            dump[3] if dump[3].strip().lower() != "#n/a" else "Unpermitted",
            dump[5],
            dump[11],
            dump[12],
            ensure_zero_if_empty(ensure_numeric_or_empty(dump[14])),
            ensure_zero_if_empty(ensure_numeric_or_empty(dump[15])),
            ensure_zero_if_empty(ensure_numeric_or_empty(dump[16])),
            " ".join(dump[17:]).strip()
        ))
    return edms


def parse_annual_edms(filepath):
    edms = []
    for dump in reading_csv(filepath, skip=2):
        edms.append(EDM(
            2021,
            WELSH_WATER,
            dump[1],
            dump[2],
            dump[3],
            dump[7], dump[8],
            ensure_zero_if_empty(ensure_numeric_or_empty(dump[9])),
            ensure_zero_if_empty(ensure_numeric_or_empty(dump[10])),
            ensure_zero_if_empty(ensure_numeric_or_empty(dump[12])),
            dump[16]
        ))
    return edms


if __name__ == "__main__":

    parser = argparse.ArgumentParser(description="process EDM 2021 files")

    parser.add_argument("--storm", help="storm file")
    parser.add_argument("--emergency", help="emergency file")
    parser.add_argument("--annual", help="annual file")
    parser.add_argument("output", help="output file")

    args = parser.parse_args()

    all_edms = itertools.chain(
        parse_storm_edms(args.storm),
        parse_emergency_edms(args.emergency),
        parse_annual_edms(args.annual)
    )

    try:
        with open(args.output, "w") as out:
            writer = csv.writer(out)
            for edm in all_edms:
                writer.writerow(edm._asdict().values())

    except Exception as e:
        os.unlink(args.output)
        raise e from None
