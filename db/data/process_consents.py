#!/usr/bin/env python3

import argparse
import csv
import re


def write_row(writer, row):
    if len(row) != 10:
        raise IOError(f"bodge was wrong, got {row}")

    writer.writerow(row)


def process_receiving_water(value):
    value = value.lower()

    value = re.sub(r"\s+", " ", value)
    value = value.replace("unnamed tributary of", "tributary of")
    value = value.replace("unnamed trib of", "tributary of")
    value = value.replace("a trib of", "")
    value = value.replace("trib of", "")
    value = value.replace("named tributary of", "tributary of")
    value = value.replace("named tributary", "tributary")
    value = value.replace("a tributary of", "")
    value = value.replace("tributary of", "")
    value = value.replace("tributary", "")
    value = value.replace("trib.", "")
    value = value.replace("trib", "")
    # value = value.replace("river", "")

    value = re.sub(r"\(.*\)", r"", value)
    value = re.sub(r"ditch (.*)", r"\1", value)
    value = re.sub(r"the\s(.*)", r"\1", value)
    value = re.sub(r"[rR]\. (.*)", r"River \1", value)
    value = re.sub(r"(.*) nt", r"\1", value)
    value = value.strip()
    value = value.title()
    value = re.sub(r"\s+", " ", value)
    return value


def test_process_receiving_water():
    assert process_receiving_water("LAND") == "Land"
    assert process_receiving_water("A TRIB OF THE RIVER EDEN") == "River Eden"
    assert process_receiving_water("A TRIBUTARY OF RIVER WEY") == "River Wey"
    assert process_receiving_water("TRIB. COWFOLD STREAM") == "Cowfold Stream"
    assert process_receiving_water("TRIB OF RIVER BURE") == "River Bure"
    assert process_receiving_water("named tributary of River Wensum") == "River Wensum"
    assert process_receiving_water("TRIBUTARY  OF RIVER WENSUM") == "River Wensum"
    assert process_receiving_water("named tributary River Wensum") == "River Wensum"
    assert process_receiving_water("tributary River Wensum") == "River Wensum"
    assert process_receiving_water("UNNAMED TRIB OF RIVER WENSUM") == "River Wensum"
    assert process_receiving_water("Trib River Stour") == "River Stour"
    assert process_receiving_water("THE RIVER WENSUM (TIDAL)") == "River Wensum"
    assert process_receiving_water("TRIBUTARY OF THE RIVER STOUR") == "River Stour"
    assert process_receiving_water("R. Ouze") == "River Ouze"
    assert process_receiving_water("Ditch River Wensum NT") == "River Wensum"


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

                outputcsv.writerow(row)
