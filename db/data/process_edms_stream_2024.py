#!/usr/bin/env python3

import argparse
import csv
import os

import bodges

if __name__ == "__main__":

    parser = argparse.ArgumentParser(description="process EDM 2024 files, generate stream id mapping")

    parser.add_argument("output", help="output file")
    parser.add_argument("input", nargs="+", help="inputs")

    args = parser.parse_args()

    try:
        with open(args.output, "w") as out:
            writer = csv.DictWriter(out,
                                    ["stream_name", "stream_name_old", "site_name_consent",
                                          "site_name_wasc", "wfd_waterbody_id", "receiving_water"])
            writer.writeheader()

            for edm in filter(lambda n: n.endswith(".csv"), args.input):
                seen = set()
                print(edm)
                with open(edm, encoding='windows-1252') as edm_file:
                    sewage = csv.reader(edm_file)
                    next(sewage)
                    next(sewage)

                    for line in sewage:

                        site_name_consent = line[2]
                        site_name_wasc = line[3]
                        wfd_waterbody_id = line[9]

                        if site_name_consent is None or site_name_consent in ["TBC"]:
                            site_name_consent = site_name_wasc

                        if not wfd_waterbody_id.startswith("GB") or len(wfd_waterbody_id) < 14:
                            wfd_waterbody_id = None
                        else:
                            wfd_waterbody_id = wfd_waterbody_id[:14]

                        row = {
                            "stream_name": line[0],
                            "stream_name_old": line[27],
                            "wfd_waterbody_id": wfd_waterbody_id,
                            "site_name_consent": site_name_consent,
                            "site_name_wasc": site_name_wasc,
                            "receiving_water": bodges.process_receiving_water(line[11])
                        }

                        writer.writerow(row)

    except Exception as e:
        os.unlink(args.output)
        raise e from None
