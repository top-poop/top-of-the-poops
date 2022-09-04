#!/usr/bin/env python3

import argparse
import csv
import re
from bodges import process_receiving_water


def process_permit_number(permit):
    return permit


def test_process_permit_number():
    assert process_permit_number("01WIG0130") == "WIG0130"
    assert process_permit_number("016993399") == "016993399"


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="process mess of consent files")

    parser.add_argument("input", default=".", help="input consent file")
    parser.add_argument("output", default=".", help="output consent file")

    args = parser.parse_args()

    with open(args.input) as input:
        with open(args.output, "w") as output:
            outputcsv = csv.writer(output)
            inputcsv = csv.reader(input)
            outputcsv.writerow(next(inputcsv))

            for row in inputcsv:
                row[17] = process_receiving_water(row[17])

                company = row[0].lower()
                if "united utilities" in company:
                    row[15] = process_permit_number(row[15])

                if row[19] == "":
                    row[19] = "Permit does not specify"

                # looks like copy and paste error at source - one of the grid references is usually ok.
                row[28] = row[28] if " " not in row[28] else row[32]
                row[32] = row[32] if " " not in row[32] else row[28]

                outputcsv.writerow(row)
