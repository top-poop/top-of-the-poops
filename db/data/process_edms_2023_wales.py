#!/usr/bin/python
import argparse
import csv
import dataclasses
import itertools
import os

from edm_types import EDM, edm_writer
from process_consents_wales import WELSH_WATER
from process_edms_2021 import ensure_zero_if_empty, ensure_numeric_or_empty, ensure_is_percentage, ensure_not_na


def reading_csv(filepath, skip=0):
    with open(filepath) as fp:
        reader = csv.reader(fp)
        if skip > 0:
            for i in range(0, skip):
                next(reader)
        for dump in reader:
            yield dump


def parse_storm_edms(filepath):
    edms = []
    for dump in reading_csv(filepath, skip=2):
        edms.append(EDM(
            reporting_year=2023,
            company_name=dump[0],
            site_name=dump[1] if dump[1].strip() not in ("", "#TBC") else dump[2],
            consent_id=dump[3] if dump[3].strip().lower() != "#n/a" else "Unpermitted",
            activity_reference=dump[5],
            shellfishery=dump[11],
            bathing=dump[12],
            total_spill_hours=ensure_zero_if_empty(ensure_numeric_or_empty(dump[15])),
            spill_count=ensure_zero_if_empty(ensure_numeric_or_empty(dump[16])),
            reporting_pct=ensure_is_percentage(ensure_zero_if_empty(ensure_numeric_or_empty(dump[19]))),
            excuses=" ".join(dump[20:]).strip(),
            wfd_waterbody_id=None,
            wasc_site_name=dump[1],
            # grid_reference="",
            edm_commissioning_info="",
            reporting_low_reason="",
            reporting_low_action="",
            spill_high_reason="",
            spill_high_action="",
            spill_high_planning=""

        ))
    return edms


def parse_emergency_edms(filepath):
    edms = []
    for dump in reading_csv(filepath, skip=2):
        edms.append(EDM(
            reporting_year=2023,
            company_name=dump[0],
            site_name=dump[1] if dump[1].strip() not in ("", "#TBC") else dump[2],
            consent_id=dump[3] if dump[3].strip().lower() != "#n/a" else "Unpermitted",
            activity_reference=dump[5],
            shellfishery=dump[11],
            bathing=dump[12],
            total_spill_hours=ensure_zero_if_empty(ensure_numeric_or_empty(dump[14])),
            spill_count=ensure_zero_if_empty(ensure_numeric_or_empty(dump[15])),
            reporting_pct=ensure_is_percentage(ensure_zero_if_empty(ensure_numeric_or_empty(dump[16]))),
            excuses=" ".join(dump[17:]).strip(),
            wfd_waterbody_id=None,
            wasc_site_name=dump[2],
            # grid_reference="",
            edm_commissioning_info="",
            reporting_low_reason="",
            reporting_low_action="",
            spill_high_reason="",
            spill_high_action="",
            spill_high_planning=""

        ))
    return edms



def parse_annual_edms(filepath):
    edms = []
    for dump in reading_csv(filepath, skip=4):
        edms.append(EDM(
            reporting_year=2023,
            company_name=WELSH_WATER,
            site_name=dump[1],
            consent_id=dump[0],
            activity_reference="",
            shellfishery=dump[13],
            bathing="",
            total_spill_hours=ensure_zero_if_empty(ensure_numeric_or_empty(dump[16])),
            spill_count=ensure_zero_if_empty(ensure_numeric_or_empty(dump[14])),
            reporting_pct=ensure_is_percentage(ensure_zero_if_empty(ensure_numeric_or_empty(dump[21]))),
            excuses=dump[22],
            wfd_waterbody_id=dump[10],
            wasc_site_name="",
            # grid_reference="",
            edm_commissioning_info="",
            reporting_low_reason="",
            reporting_low_action="",
            spill_high_reason="",
            spill_high_action="",
            spill_high_planning=""
        ))
    return edms


def parse_emergency_edms2(filepath):
    edms = []
    for dump in reading_csv(filepath, skip=4):
        edms.append(EDM(
            reporting_year=2023,
            company_name=WELSH_WATER,
            site_name=dump[1],
            consent_id=dump[0],
            activity_reference="",
            shellfishery=ensure_not_na(dump[13]),
            bathing="",
            total_spill_hours=ensure_zero_if_empty(ensure_numeric_or_empty(dump[16])),
            spill_count=ensure_zero_if_empty(ensure_numeric_or_empty(dump[14])),
            reporting_pct=ensure_is_percentage(ensure_zero_if_empty(ensure_numeric_or_empty(dump[21]))),
            excuses=dump[21],
            wfd_waterbody_id=dump[10],
            wasc_site_name="",
            # grid_reference="",
            edm_commissioning_info="",
            reporting_low_reason="",
            reporting_low_action="",
            spill_high_reason="",
            spill_high_action="",
            spill_high_planning=""
        ))
    return edms


if __name__ == "__main__":

    parser = argparse.ArgumentParser(description="process EDM 2023 files")

    parser.add_argument("--england", help="england file")
    parser.add_argument("--storm", help="storm file")
    parser.add_argument("--emergency", help="emergency file")
    parser.add_argument("--emergency-2", help="more emergency file")
    parser.add_argument("--annual", help="annual file")
    parser.add_argument("output", help="output file")

    args = parser.parse_args()

    all_edms = itertools.chain(
        parse_storm_edms(args.storm),
        parse_emergency_edms(args.emergency),
        parse_emergency_edms2(args.emergency_2),
        parse_annual_edms(args.annual)
    )

    dedup = {}

    def edm_key(e):
        return "-".join([e.consent_id])

    with open(args.england) as fp:
        reader = csv.DictReader(fp)
        for row in reader:
            edm = EDM(**row)
            dedup[edm_key(edm)]=edm

    try:
        with edm_writer(args.output) as writer:
            for edm in all_edms:
                key = edm_key(edm)
                if key in dedup:
                    print(f"Duplicate: {edm}")
                    print(f"Duplicate: {dedup[key]}")
                else:
                    writer(edm)

    except Exception as e:
        os.unlink(args.output)
        raise e from None
