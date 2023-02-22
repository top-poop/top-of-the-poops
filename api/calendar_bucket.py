import datetime
from collections import defaultdict
from typing import Optional


class DayBucket:
    def __init__(self):
        self.states = defaultdict(lambda: datetime.timedelta(seconds=0))

    def allocate(self, state, delta: datetime.timedelta):
        self.states[state] += delta
        if self.states[state] > datetime.timedelta(days=1):
            raise ValueError("Can only have one day's worth of time in a bucket")

    def totals(self):
        return self.states


def midnight(d: datetime.date):
    return datetime.datetime(d.year, d.month, d.day)


class Calendar:
    def __init__(self, start: datetime.date):
        self.start = start
        self.buckets = defaultdict(lambda: DayBucket())

    def add(self, state: str, start: Optional[datetime.datetime], end: datetime.datetime):
        if start is None:
            start = midnight(self.start)

        for i in range((end - start).days + 1):
            day = start.date() + datetime.timedelta(days=i)

            bucket = self.buckets[day]

            day_midnight = midnight(day)
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
    c = Calendar(date_of("2023-01-01"))

    c.add("online", None, datetime_of("2023-01-02 02:00"))

    b = c.allocations()
    assert len(b) == 2
    assert b[0] == (date_of("2023-01-01"), {"online": datetime.timedelta(days=1)})
    assert b[1] == (date_of("2023-01-02"), {"online": datetime.timedelta(hours=2)})


def test_calendar_with_multiple_events_single_day_same_type():
    c = Calendar(date_of("2023-01-01"))
    c.add("online", datetime_of("2023-01-01 00:00"), datetime_of("2023-01-01 02:00"))
    c.add("online", datetime_of("2023-01-01 22:00"), datetime_of("2023-01-02 00:00"))

    b = c.allocations()
    assert len(b) == 1
    assert b[0] == (date_of("2023-01-01"), {"online": datetime.timedelta(hours=4)})


def test_calendar_with_multiple_events_single_day_multiple_types():
    c = Calendar(date_of("2023-01-01"))
    c.add("online", datetime_of("2023-01-01 00:00"), datetime_of("2023-01-01 02:00"))
    c.add("offline", datetime_of("2023-01-01 02:00"), datetime_of("2023-01-01 22:00"))
    c.add("online", datetime_of("2023-01-01 22:00"), datetime_of("2023-01-02 00:00"))

    b = c.allocations()
    assert len(b) == 1
    assert b[0] == (
    date_of("2023-01-01"), {"online": datetime.timedelta(hours=4), "offline": datetime.timedelta(hours=20)})
