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
    columns = { desc[0]:i for i, desc in enumerate(cursor.description)}

    while True:
        rows = cursor.fetchmany(size)
        if not rows:
            break
        for row in rows:
            yield { k:row[v] for k,v in columns.items()}


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

            features = []

            for row in iter_row(cursor, 20):

                geometry = json.loads(row["geometry"])
                constituency = row["constituency"]

                features.append({
                    "type": "Feature",
                    "id": kebabcase(constituency),
                    "properties": {
                        "name": constituency,
                        "total_spills": row["total_spills"],
                        "total_hours":  row["total_hours"],
                        "cso_count":    row["cso_count"],
                    },
                    "geometry": geometry
                })

            geojson = {
                "type": "FeatureCollection",
                "features": features
            }

            with open(args.output, "w") as f:
                json.dump(geojson, f, cls=DecimalEncoder)


