#!/usr/bin/env python
import argparse
import os
import re

import psycopg2


# https://github.com/zhoujin7/casestyle/blob/master/casestyle.py
def kebabcase(string):
    s_list = casepreprocess(string)
    if s_list:
        return '-'.join(s_list)
    return ''


def casepreprocess(string):
    if isinstance(string, str):
        string = string.strip().replace('-', ' ')
        if string != '_' * len(string):
            underscore_at_start = ''
            if string.startswith('_'):
                j = 1
                for i, _ in enumerate(string):
                    if i < len(string):
                        if string[i + 1] == string[i]:
                            j += 1
                        else:
                            break
                underscore_at_start = '_' * j
            underscore_at_end = ''
            if string.endswith('_'):
                j = 1
                for i in range(len(string) - 1, -1, -1):
                    if i > 0:
                        if string[i - 1] == string[i]:
                            j += 1
                        else:
                            break
                underscore_at_end = '_' * j
        else:
            return []
        string = string.replace('_', ' ')
        string = '%s%s%s' % (underscore_at_start, string, underscore_at_end)
        # string = f'{underscore_at_start}{string}{underscore_at_end}'
        string = re.sub('(.)([A-Z][a-z]+)', r'\1 \2', string)
        string = re.sub('([a-z0-9])([A-Z])', r'\1 \2', string).lower()
        s_list = string.split()
        return s_list
    else:
        raise TypeError("casepreprocess() argument must be str")


def iter_row(cursor, size=10):
    while True:
        rows = cursor.fetchmany(size)
        if not rows:
            break
        for row in rows:
            yield row


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="generate constituency shape files")
    parser.add_argument("output", help="output directory")

    args = parser.parse_args()

    output_dir = args.output

    os.makedirs(output_dir, exist_ok=True)

    with psycopg2.connect(host="localhost", database="gis", user="docker", password="docker") as conn:

        tolerance = 0.005

        sql = f"select pcon20nm as name, " \
              f"st_npoints(wkb_geometry) as points_original, " \
              f"st_npoints(st_simplifypreservetopology(wkb_geometry, {tolerance})) as points_reduced, " \
              f"st_asgeojson(st_simplifypreservetopology(wkb_geometry, {tolerance})) as geometry " \
              f"from pcon_dec_2020_uk_bfc;"

        with conn.cursor() as cursor:
            cursor.execute(sql)

            columns = [desc[0] for desc in cursor.description]

            for row in iter_row(cursor, 20):
                (name, points_original, points_reduced, geom) = row
                print(f"{name} orig={points_original} reduced={points_reduced}")

                with open(os.path.join(output_dir, f"{kebabcase(name)}.json"), "w") as fp:
                    fp.write(geom)
