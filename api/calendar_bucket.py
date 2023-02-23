import datetime
import math
from collections import defaultdict

import pytest


class DayBucket:
    def __init__(self):
        self.states = defaultdict(lambda: datetime.timedelta(seconds=0))
        self.total = datetime.timedelta(seconds=0)

    def allocate(self, state, delta: datetime.timedelta):
        self.total += delta
        self.states[state] += delta
        if self.states[state] > datetime.timedelta(days=1):
            raise ValueError("Can only have one day's worth of time in a bucket")
        if self.total > datetime.timedelta(days=1):
            raise ValueError("More than 1 day's worth in a single day!")
        return self

    def totals(self):
        return {k: v for (k, v) in self.states.items()}


def at_midnight(d: datetime.date):
    return datetime.datetime(d.year, d.month, d.day)


class Calendar:
    def __init__(self, initial_state: str, start: datetime.date):
        self.buckets = defaultdict(lambda: DayBucket())

        self.current_state = initial_state
        self.last = at_midnight(start)

    def add(self, state: str, at: datetime.datetime):

        if at < self.last:
            raise ValueError(f"Events must be in sequence, last {self.last}, this {at}")

        day = self.last.date()

        while day <= at.date():

            bucket = self.buckets[day]

            day_midnight = at_midnight(day)
            next_day = day_midnight + datetime.timedelta(days=1)

            if self.last > day_midnight and at < next_day:
                delta = at - self.last
            elif self.last > day_midnight:
                delta = next_day - self.last
            elif at < next_day:
                delta = at - day_midnight
            else:
                delta = next_day - day_midnight

            if delta.total_seconds() > 0:
                bucket.allocate(self.current_state, delta)

            day += datetime.timedelta(days=1)

        self.current_state = state
        self.last = at

    def allocations(self):
        dates = sorted(self.buckets.keys())
        return [(d, self.buckets[d].totals()) for d in dates if self.buckets[d].total.total_seconds() > 0]


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
    c = Calendar("unknown", date_of("2023-01-01"))

    c.add("online", datetime_of("2023-01-02 02:00"))
    c.add("now", at_midnight(datetime_of("2023-01-04")))
    b = c.allocations()

    assert len(b) == 3
    assert b[0] == (date_of("2023-01-01"), {"unknown": datetime.timedelta(days=1)})
    assert b[1] == (
    date_of("2023-01-02"), {"unknown": datetime.timedelta(hours=2), "online": datetime.timedelta(hours=22)})
    assert b[2] == (date_of("2023-01-03"), {"online": datetime.timedelta(hours=24)})


def test_calendar_with_multiple_events_single_day_same_type():
    c = Calendar("unknown", date_of("2023-01-01"))
    c.add("online", datetime_of("2023-01-01 02:00"))
    c.add("online", datetime_of("2023-01-02 00:00"))

    b = c.allocations()
    assert len(b) == 1
    assert b[0] == (
    date_of("2023-01-01"), {"unknown": datetime.timedelta(hours=2), "online": datetime.timedelta(hours=22)})


def test_calendar_with_multiple_events_single_day_multiple_types():
    c = Calendar("unknown", date_of("2023-01-01"))
    c.add("online", datetime_of("2023-01-01 00:00"))
    c.add("offline", datetime_of("2023-01-01 02:00"))
    c.add("online", datetime_of("2023-01-01 22:00"))
    c.add("now", datetime_of("2023-01-02 00:00"))

    b = c.allocations()
    assert len(b) == 1
    assert b[0] == (
    date_of("2023-01-01"), {"online": datetime.timedelta(hours=4), "offline": datetime.timedelta(hours=20)})


def test_rejects_previously_seen():
    c = Calendar("unknown", date_of("2023-01-01"))
    c.add("online", datetime_of("2023-01-01 02:00"))
    with pytest.raises(ValueError):
        c.add("whatever", datetime_of("2023-01-01 01:59"))


def list_item_on(l, d: datetime.date):
    return list(filter(lambda it: it[0] == d, l))[0]


def test_realistic_example():
    c = Calendar("unknown", date_of("2022-12-01"))

    c.add("overflowing", datetime_of("2022-12-23 09:15:00"))
    c.add("online", datetime_of("2022-12-23 10:45:00"))
    c.add("overflowing", datetime_of("2023-01-08 13:30:00"))
    c.add("online", datetime_of("2023-01-08 14:00:00"))
    c.add("offline", datetime_of("2023-01-19 12:30:00"))
    c.add("offline", datetime_of("2023-01-23 08:45:00"))
    c.add("now", at_midnight(date_of("2023-02-01")))

    b = c.allocations()

    assert list_item_on(b, date_of("2023-01-19")) == (date_of("2023-01-19"),
                                                      {"online": datetime.timedelta(hours=12, minutes=30),
                                                       "offline": datetime.timedelta(hours=11, minutes=30)})
    assert list_item_on(b, date_of("2023-01-23")) == (date_of("2023-01-23"), {"offline": datetime.timedelta(hours=24)})



class Summariser:

    def _key(self, c, td: datetime.timedelta):
        s = int(math.ceil(int(td.total_seconds() / 3600) / 4) * 4)
        return f"{c}-{s}"

    def summarise(self, b: dict):
        totals= b
        if "overflowing" in totals:
            return self._key("o", totals["overflowing"])
        elif "potentially_overflowing" in totals:
            return self._key("p", totals["potentially_overflowing"])
        elif "offline" in totals:
            return self._key("z", totals["offline"])
        elif "unknown" in totals:
            return self._key("u", totals["unknown"])
        elif "online" in totals:
            return self._key("a", totals["online"])

def hours(n):
    return datetime.timedelta(hours=n)

def test_summariser_simple():
    s = Summariser()
    assert s.summarise(DayBucket().allocate("unknown", hours(24)).totals()) == "u-24"
    assert s.summarise(DayBucket().allocate("overflowing", hours(24)).totals()) == "o-24"
    assert s.summarise(DayBucket().allocate("offline", hours(24)).totals()) == "z-24"
    assert s.summarise(DayBucket().allocate("online", hours(24)).totals()) == "a-24"
    assert s.summarise(DayBucket().allocate("potentially_overflowing", hours(24)).totals()) == "p-24"

def test_summariser_offline_over_online():
    s = Summariser()
    assert s.summarise(
        DayBucket().allocate("online", hours(20)).allocate("offline", hours(4)).totals()
    ) == "z-4"

def test_summariser_potentially_over_offline():
    s = Summariser()
    assert s.summarise(
        DayBucket().allocate("potentially_overflowing", hours(20)).allocate("offline", hours(4)).totals()
    ) == "p-20"

def test_summariser_unknown_over_online():
    s = Summariser()
    assert s.summarise(
        DayBucket().allocate("online", hours(20)).allocate("unknown", hours(4)).totals()
    ) == "u-4"
    assert s.summarise(
        DayBucket().allocate("online", hours(12)).allocate("unknown", hours(12)).totals()
    ) == "u-12"
    assert s.summarise(
        DayBucket().allocate("online", hours(19)).allocate("unknown", hours(5)).totals()
    ) == "u-8"

def test_summariser_overflowing_over_others():
    s = Summariser()
    assert s.summarise(
        DayBucket().allocate("online", hours(20)).allocate("overflowing", hours(4)).totals()
    ) == "o-4"
    assert s.summarise(
        DayBucket().allocate("offline", hours(20)).allocate("overflowing", hours(4)).totals()
    ) == "o-4"
    assert s.summarise(
        DayBucket().allocate("unknown", hours(20)).allocate("overflowing", hours(4)).totals()
    ) == "o-4"







