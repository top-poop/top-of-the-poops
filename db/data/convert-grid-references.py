#!/usr/bin/env python
import argparse
import contextlib
import csv
import re
import sys

import osgb


@contextlib.contextmanager
def smart_open(filename=None):
    if filename and filename != '-':
        fh = open(filename, 'w')
    else:
        fh = sys.stdout

    try:
        yield fh
    finally:
        if fh is not sys.stdout:
            fh.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="run sql script and make json")
    parser.add_argument("input", help="consents file")
    parser.add_argument("output", default="-", nargs="?", help="output file")

    args = parser.parse_args()

    with open(args.input) as ifp:

        input_csv = csv.reader(ifp)
        next(input_csv)

        references = set()

        for row in input_csv:
            grid_reference = row[28]

            references.add(grid_reference)

    with smart_open(args.output) as fp:

        writer = csv.writer(fp)

        writer.writerow(["grid_reference", "lat", "lon"])

        for grid_reference in references:

            try:
                (easting, northing) = osgb.parse_grid(grid_reference)
            except osgb.gridder.GarbageError:
                # invalid grid reference, align to sheet if possible
                print(f"invalid grid reference {grid_reference}", file=sys.stderr)
                match = re.search(r"(^[A-Z]{2})", grid_reference)
                if match:
                    sheet = match.group(1)
                    (easting, northing) = osgb.parse_grid(sheet)
                    print(f"Bodged it to {sheet}", file=sys.stderr)
                else:
                    continue

            (lat, lon) = osgb.grid_to_ll(easting=easting, northing=northing)

            writer.writerow([grid_reference, lat, lon])
