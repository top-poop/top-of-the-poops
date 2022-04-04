import argparse
import json
import os
from decimal import Decimal

import psycopg2

from constituencies import kebabcase


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

        with open(os.path.join(MYDIR, "chloropleth.sql")) as f:
            sql = f.read()

        with conn.cursor() as cursor:
            cursor.execute(sql)

            columns = [desc[0] for desc in cursor.description]

            features = []

            for row in iter_row(cursor, 20):
                (constituency, total_spills, total_hours,
                 spills_increase, hours_increase, mp_name, mp_party, uri, screen_name, geom) = row

                geometry = json.loads(geom)

                features.append({
                    "type": "Feature",
                    "id": kebabcase(constituency),
                    "properties": {
                        "name": constituency,
                        "total_spills": total_spills,
                        "total_hours": total_hours,
                        "spills_increase": spills_increase,
                        "hours_increase": hours_increase,
                        "mp_name": mp_name,
                        "mp_party": mp_party,
                    },
                    "geometry": geometry
                })

            geojson = {
                "type": "FeatureCollection",
                "features": features
            }

            with open(args.output, "w") as f:
                json.dump(geojson, f, cls=DecimalEncoder)


