import argparse
import csv
import struct

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create stations from data files")

    parser.add_argument("input", help="input file")
    parser.add_argument("output", help="output files")

    args = parser.parse_args()

    started = False

    widths = []
    widths.extend([4])
    widths.extend([7] * 12)
    widths.extend([8] * 5)

    format = " ".join([f"{fw}s" for fw in widths])

    unpack = struct.Struct(format).unpack_from
    parse = lambda line: tuple(s.decode().strip() for s in unpack(line.encode()))

    data = []

    with open(args.input) as f:
        for line in f.readlines():
            if not started:
                if line.startswith("year"):
                    started = True
            else:
                data.append(parse(line))


    with open(args.output, "w") as f:
        writer = csv.DictWriter(f, ["Year", "Month", "Rainfall"])
        writer.writeheader()
        for year_data in data:
            for month in range(1, 13):
                rainfall = year_data[month]
                if rainfall:
                    writer.writerow({ "Year": year_data[0], "Month": month, "Rainfall": rainfall})

