#!/usr/bin/env python
import argparse
import contextlib
import csv
import re
import sys
from typing import Callable, Iterable, Tuple
from typing import TypeVar

import osgb
import psycopg2

T = TypeVar('T')

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

def iter_row(cursor, size=10, f: Callable[[Tuple], T] = lambda t: t) -> Iterable[T]:
    while True:
        rows = cursor.fetchmany(size)
        if not rows:
            break
        for row in rows:
            yield f(row)


def select_many(connection, sql, params=None, f: Callable[[Tuple], T] = lambda t: t) -> Iterable[T]:
    with connection.cursor() as cursor:
        cursor.execute(sql, params)
        yield from iter_row(cursor, size=100, f=f)


select_sql = """
    select outlet_grid_ref, effluent_grid_ref from consents
"""

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="run sql script and make json")
    parser.add_argument("output", default="-", nargs="?", help="output file")

    args = parser.parse_args()

    references = set()

    with psycopg2.connect(host="localhost", database="gis", user="docker", password="docker") as conn:
        for o, r in select_many(conn, select_sql, f=lambda row: (row[0], row[1])):
            references.add(o)
            references.add(r)

    with smart_open(args.output) as fp:

        writer = csv.writer(fp)

        writer.writerow(["grid_reference", "lat", "lon"])

        for grid_reference in references:

            try:
                (easting, northing) = osgb.parse_grid(grid_reference)
            except osgb.gridder.UndefinedSheetError as e:
                print(f"{e}", file=sys.stderr)
                continue
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

            writer.writerow([grid_reference, lat, lon, '', ''])
