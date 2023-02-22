import datetime
from collections import defaultdict
from typing import Optional

import pytest


class DayBucket:
    def __init__(self):
        self.states = defaultdict(lambda: datetime.timedelta(seconds=0))

    def allocate(self, state, delta: datetime.timedelta):
        self.states[state] += delta
        if self.states[state] > datetime.timedelta(days=1):
            raise ValueError("Can only have one day's worth of time in a bucket")

    def totals(self):
        return self.states


def at_midnight(d: datetime.date):
    return datetime.datetime(d.year, d.month, d.day)


class Calendar:
    def __init__(self, start: datetime.date, end: datetime.date):
        self.start = start
        self.end = end
        self.buckets = defaultdict(lambda: DayBucket())
        self.last_seen = None

    def add(self, state: str, start: Optional[datetime.datetime], end: datetime.datetime):
        if start is None:
            start = at_midnight(self.start)

        if end is None:
            end = at_midnight(self.end + datetime.timedelta(days=1))

        if self.last_seen is not None:
            if start < self.last_seen:
                raise ValueError("dates have to be non-overlapping")

        self.last_seen = end

        for i in range((end - start).days + 1):
            day = start.date() + datetime.timedelta(days=i)

            bucket = self.buckets[day]

            day_midnight = at_midnight(day)
            next_day = day_midnight + datetime.timedelta(days=1)

            if start > day_midnight and end < next_day:
                delta = end - start
            elif start > day_midnight:
                delta = next_day - start
            elif end < next_day:
                delta = end - day_midnight
            else:
                delta = next_day - day_midnight

            bucket.allocate(state, delta)

    def allocations(self):
        dates = sorted(self.buckets.keys())
        return [(d, self.buckets[d].states) for d in dates]


def date_of(s: str) -> datetime.date:
    return datetime.date.fromisoformat(s)


def datetime_of(s: str) -> datetime.datetime:
    return datetime.datetime.fromisoformat(s)


def test_day_bucket():
    d = DayBucket()
    d.allocate("on", datetime.timedelta(seconds=10))
    d.allocate("off", datetime.timedelta(seconds=15))
    d.allocate("on", datetime.timedelta(seconds=10))

    assert d.totals() == {"on": datetime.timedelta(seconds=20), "off": datetime.timedelta(seconds=15)}


def test_calendar_with_single_event_spanning_multiple_days():
    c = Calendar(date_of("2023-01-01"), date_of("2023-02-22"))

    c.add("online", None, datetime_of("2023-01-02 02:00"))

    b = c.allocations()
    assert len(b) == 2
    assert b[0] == (date_of("2023-01-01"), {"online": datetime.timedelta(days=1)})
    assert b[1] == (date_of("2023-01-02"), {"online": datetime.timedelta(hours=2)})


def test_calendar_with_multiple_events_single_day_same_type():
    c = Calendar(date_of("2023-01-01"), date_of("2023-02-22"))
    c.add("online", datetime_of("2023-01-01 00:00"), datetime_of("2023-01-01 02:00"))
    c.add("online", datetime_of("2023-01-01 22:00"), datetime_of("2023-01-02 00:00"))

    b = c.allocations()
    assert len(b) == 1
    assert b[0] == (date_of("2023-01-01"), {"online": datetime.timedelta(hours=4)})


def test_calendar_with_multiple_events_single_day_multiple_types():
    c = Calendar(date_of("2023-01-01"), date_of("2023-02-22"))
    c.add("online", datetime_of("2023-01-01 00:00"), datetime_of("2023-01-01 02:00"))
    c.add("offline", datetime_of("2023-01-01 02:00"), datetime_of("2023-01-01 22:00"))
    c.add("online", datetime_of("2023-01-01 22:00"), datetime_of("2023-01-02 00:00"))

    b = c.allocations()
    assert len(b) == 1
    assert b[0] == (date_of("2023-01-01"), {"online": datetime.timedelta(hours=4), "offline": datetime.timedelta(hours=20)})


def test_calendar_fills_to_end():
    c = Calendar(date_of("2023-01-01"), date_of("2023-02-22"))
    c.add("online", datetime_of("2023-01-01 00:00"), datetime_of("2023-01-01 02:00"))


def test_rejects_previously_seen():
    c = Calendar(date_of("2023-01-01"), date_of("2023-02-22"))
    c.add("online", datetime_of("2023-01-01 00:00"), datetime_of("2023-01-01 02:00"))
    with pytest.raises(Exception):
        c.add("whatever", datetime_of("2023-01-01 01:59"), datetime_of("2023-01-01 02:00") )


def test_realistic_example():
    c = Calendar(date_of("2023-01-01"), date_of("2023-02-22"))

    c.add("unknown",     None,                               datetime_of("2022-12-23 09:15:00"))
    c.add("overflowing", datetime_of("2022-12-23 09:15:00"), datetime_of("2022-12-23 10:45:00"))
    c.add("online",      datetime_of("2022-12-23 10:45:00"), datetime_of("2023-01-08 13:30:00"))
    c.add("overflowing", datetime_of("2023-01-08 13:30:00"), datetime_of("2023-01-08 14:00:00"))
    c.add("online",      datetime_of("2023-01-08 14:00:00"), datetime_of("2023-01-19 12:30:00"))
    c.add("offline",     datetime_of("2023-01-19 12:30:00"), datetime_of("2023-01-23 08:45:00"))
    c.add("offline",     datetime_of("2023-01-23 08:45:00"), None)
