import argparse
import json
import os
import re
from decimal import Decimal

import psycopg2


def kebabcase(s):
    return "-".join(re.findall(
        r"[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+",
        s.lower()
    ))


class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(str(obj))
        return json.JSONEncoder.default(self, obj)


def iter_row(cursor, size=10):
    while True:
        rows = cursor.fetchmany(size)
        if not rows:
            break
        for row in rows:
            yield row


MYDIR = os.path.dirname(__file__)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="generate chloropleth map for E&W")
    parser.add_argument("output", help="output file")

    args = parser.parse_args()

    output_dir = args.output

    with psycopg2.connect(host="localhost", database="gis", user="docker", password="docker") as conn:

        with open(os.path.join(MYDIR, "chloropleth-counties.sql")) as f:
            sql = f.read()

        with conn.cursor() as cursor:
            cursor.execute(sql)

            columns = [desc[0] for desc in cursor.description]

            features = []

            for row in iter_row(cursor, 20):
                (county, total_spills, total_hours, spills_increase, hours_increase, geom) = row

                geometry = json.loads(geom)

                features.append({
                    "type": "Feature",
                    "id": kebabcase(county),
                    "properties": {
                        "name": county,
                        "total_spills": total_spills,
                        "total_hours": total_hours,
                        "spills_increase": spills_increase,
                        "hours_increase": hours_increase,
                    },
                    "geometry": geometry
                })

            geojson = {
                "type": "FeatureCollection",
                "features": features
            }

            with open(args.output, "w") as f:
                json.dump(geojson, f, cls=DecimalEncoder)
