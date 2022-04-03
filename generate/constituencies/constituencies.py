#!/usr/bin/env python
import argparse
import os
import re

import psycopg2


def kebabcase(s):
    return "-".join(re.findall(
        r"[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+",
        s.lower()
    ))


def test_kebabcase():
    assert kebabcase("bob") == "bob"
    assert kebabcase("bob smith") == "bob-smith"
    assert kebabcase("Bob Smith") == "bob-smith"
    assert kebabcase("Bob,Smith") == "bob-smith"


def iter_row(cursor, size=10):
    while True:
        rows = cursor.fetchmany(size)
        if not rows:
            break
        for row in rows:
            yield row


MYDIR = os.path.dirname(__file__)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="generate constituency shape files")
    parser.add_argument("output", help="output directory")

    args = parser.parse_args()

    output_dir = args.output

    os.makedirs(output_dir, exist_ok=True)

    with psycopg2.connect(host="localhost", database="gis", user="docker", password="docker") as conn:

        with open(os.path.join(MYDIR, "constituencies.sql")) as f:
            sql = f.read()

        with conn.cursor() as cursor:
            cursor.execute(sql)

            columns = [desc[0] for desc in cursor.description]

            for row in iter_row(cursor, 20):
                (constituency, first_name, last_name, screen_name, points_original, points_reduced, geom) = row
                print(f"{constituency} orig={points_original} reduced={points_reduced}")

                with open(os.path.join(output_dir, f"{kebabcase(constituency)}.json"), "w") as fp:
                    fp.write(geom)
