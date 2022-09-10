#!/usr/bin/python3
import argparse
import csv
import re
from pathlib import Path

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create stations from data files")

    parser.add_argument("stations", help="stations output file")
    parser.add_argument("rainfall", help="rainfall output file")
    parser.add_argument("input", nargs="+", help="input files")

    args = parser.parse_args()

    locations = []
    rainfall = []

    for file in args.input:

        code = Path(file).stem

        with open(file) as f:
            name = f.readline().strip()

            location = ""

            while True:
                l = f.readline().strip()
                if not l.startswith("Estimated"):
                    location += l
                else:
                    break

            match = re.match(r"^Location.*Lat\s+([-.\d]+)\s+Lon\s+([-.\d]+)", location)

            if match is None:
                raise IOError(f"Can't find location for {name}")

            lat, lon = match.groups()

            locations.append([code, name, lat, lon])

            while True:
                l = f.readline().strip()
                if l.startswith("yyyy"):
                    break

            f.readline()

            for l in f.readlines():
                if l.lower().startswith("site closed"):
                    continue
                print(l)
                year, month, tmax, tmin, frost, rain, *rest = l.strip().split(maxsplit=7)

                if rain.startswith("-"):
                    continue

                rain = rain.replace("*", "")


                rainfall.append({"code": code, "year": year, "month": month, "rain": rain})

    with open(args.stations, "w") as f:
        writer = csv.DictWriter(f, ["Code", "Name", "Lat", "Lon"])
        writer.writeheader()
        for l in locations:
            writer.writerow({"Code": l[0], "Name": l[1], "Lat": l[2], "Lon": l[3]})

    with open(args.rainfall, "w") as f:
        writer = csv.DictWriter(f, ["Code", "Year", "Month", "Rain"])
        writer.writeheader()
        for l in rainfall:
            writer.writerow({ "Code": l["code"], "Year": l["year"], "Month": l["month"], "Rain":l["rain"]})
