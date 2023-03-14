#!/usr/bin/env python3
import argparse
import csv
import dataclasses
import datetime
import functools
import os
import pathlib
from collections import defaultdict
from typing import List

from bbevent import BBEvent

if __name__ == "__main__":

    parser = argparse.ArgumentParser()
    parser.add_argument("folder", type=pathlib.Path)
    parser.add_argument("output", type=pathlib.Path)

    args = parser.parse_args()

    folder: pathlib.Path = args.folder

    if not folder.is_dir():
        raise ValueError("Expecting a folder")

    unique = defaultdict(lambda: [])

    for file in [folder / f for f in filter(lambda f: f.endswith("_Spills.csv"), os.listdir(folder))]:
        with open(file) as fh:
            print(file)
            csvfile = csv.DictReader(fh)
            fieldnames = csvfile.fieldnames
            for row in csvfile:
                event = BBEvent(**row)
                key = f"{event.eventId}/{event.siteUnitNumber}/{event.associatedSiteId}"
                unique[key].append(event)

    def pick_later(acc, e):
        if int(e.id) > int(acc.id):
            return e
        return acc

    def parse_bodgy_date(s:str):
        if "." in s:
            return datetime.datetime.fromisoformat(s[0:s.index(".")])
        return datetime.datetime.fromisoformat(s)

    def parse_dates(e):
        return dataclasses.replace(
            e,
            eventStart=parse_bodgy_date(e.eventStart),
            eventStop=parse_bodgy_date(e.eventStop)
        )

    def reduce_stream(events: List[BBEvent]):
        events = [parse_dates(e) for e in events]
        return functools.reduce(pick_later, events[1:], events[0])

    values = unique.values()

    print(f"Have {len(values)} groups of events to consider")

    final = sorted(
        [reduce_stream(events) for events in values],
        key=lambda e: e.eventStart
    )

    def stringify_dates(e:BBEvent):
        return dataclasses.replace(
            e,
            eventStart=e.eventStart.isoformat(),
            eventStop=e.eventStop.isoformat()
        )

    with open(args.output, "w") as fh:
        csvfile = csv.DictWriter(fh, fieldnames=fieldnames)
        csvfile.writeheader()
        for event in (stringify_dates(e) for e in final):
            csvfile.writerow(dataclasses.asdict(event))