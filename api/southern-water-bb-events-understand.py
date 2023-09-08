#!/usr/bin/env python3
import argparse
import csv
import dataclasses
import datetime
import os
import pathlib
from collections import defaultdict
from typing import List, Set


def parse_bodgy_date(s: str):
    if "." in s:
        return datetime.datetime.fromisoformat(s[0:s.index(".")])
    return datetime.datetime.fromisoformat(s)


def parse_dates(e):
    return dataclasses.replace(
        e,
        eventStart=parse_bodgy_date(e.eventStart),
        eventStop=parse_bodgy_date(e.eventStop)
    )


@dataclasses.dataclass(frozen=True)
class Event:
    when: datetime.datetime
    id: str
    eventId: str
    siteUnitNumber: str
    bathingSite: str
    eventStart: str | datetime.datetime
    eventStop: str | datetime.datetime
    duration: int
    activity: str
    associatedSiteId: str
    outfallName: str
    isImpacting: bool  # For some reason this is always false in source data. ignore

    def key(self):
        return f"{self.eventId}/{self.siteUnitNumber}/{self.associatedSiteId}"


class Incident:

    def __init__(self):
        self.updated = False
        self.events: List[Event] = []

    def add(self, event: Event):
        self.events.append(event)
        self.updated = True

    def _sort(self):
        if self.updated:
            self.events = sorted(self.events, key=lambda e: e.when)

    def count(self):
        return len(self.events)

    def event_id(self) -> str:
        self._sort()
        return self.events[-1].eventId

    def bathing(self):
        self._sort()
        return " & ".join(set([e.bathingSite for e in self.events]))

    def outfall(self):
        self._sort()
        return " & ".join(set([e.outfallName for e in self.events]))

    def activities(self) -> Set[str]:
        self._sort()
        return set([e.activity for e in self.events])

    def reviewed(self):
        self._sort()
        return any(["Under Review" in a for a in self.activities()])

    def impacting(self):
        self._sort()
        return "Genuine" in self.activities()

    def non_impacting(self):
        self._sort()
        return len({"Genuine - Non Impacting", "Under Review - Non Impacting"}.intersection(self.activities())) > 0

    def genuine(self):
        self._sort()
        return len({"Genuine", "Genuine - Non Impacting"}.intersection(self.activities())) > 0

    def non_genuine(self):
        self._sort()
        return "Not Genuine" in self.activities()

    def start(self) -> datetime.datetime:
        return min([e.eventStart for e in self.events])

    def end(self) -> datetime.datetime:
        return max([e.eventStop for e in self.events])

    def duration(self):
        self._sort()
        return (self.end() - self.start()).total_seconds()

    def first_seen(self):
        self._sort()
        return min([e.when for e in self.events])

    def last_seen(self):
        self._sort()
        return max([e.when for e in self.events])


if __name__ == "__main__":

    parser = argparse.ArgumentParser()
    parser.add_argument("folder", type=pathlib.Path)
    parser.add_argument("output", type=pathlib.Path)

    args = parser.parse_args()

    folder: pathlib.Path = args.folder

    if not folder.is_dir():
        raise ValueError("Expecting a folder")

    unique = defaultdict(lambda: Incident())

    files = filter(lambda f: f.endswith("_Spills.csv"), os.listdir(folder))
    for file in [folder / f for f in files]:
        with open(file) as fh:
            print(file)
            when = datetime.datetime.strptime(file.name.replace("_Spills.csv", ""), "%Y%m%d-%H%M%S")
            csvfile = csv.DictReader(fh)
            fieldnames = csvfile.fieldnames
            for row in csvfile:
                row = {k: v.strip() for k, v in row.items()}
                event = parse_dates(Event(when=when, **row))
                unique[event.key()].add(event)

    incidents = sorted(unique.values(), key=lambda i: i.start())

    with (folder / "summary.csv").open("w") as fh:
        csvfile = csv.DictWriter(fh, fieldnames=[
            "event_id", "event_count", "outfall", "site", "first_seen", "last_seen", "start", "end", "duration_minutes", "duration_hours",
            "is_reviewed", "is_genuine", "is_non_genuine", "is_impacting", "is_non_impacting"
        ])
        csvfile.writeheader()

        for incident in incidents:
            csvfile.writerow({
                "event_id": incident.event_id(),
                "event_count": incident.count(),
                "outfall": incident.outfall(),
                "site": incident.bathing(),
                "first_seen": incident.first_seen(),
                "last_seen": incident.last_seen(),
                "start": incident.start(),
                "end": incident.end(),
                "duration_minutes": "{:.0f}".format(incident.duration() / 60.0),
                "duration_hours": "{:.2f}".format(incident.duration() / (60.0 * 60.0)),
                "is_reviewed": incident.reviewed(),
                "is_genuine": incident.genuine(),
                "is_non_genuine": incident.non_genuine(),
                "is_impacting": incident.impacting(),
                "is_non_impacting": incident.non_impacting()
            })
