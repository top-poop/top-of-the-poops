import datetime
import json
from collections import defaultdict
from typing import Any, Mapping, Optional

import psycopg2
from statemachine import StateMachine, State
from statemachine.contrib.diagram import DotGraphMachine

from api.calendar_bucket import Calendar, at_midnight
from api.psy import select_many
from api.thames import TWEvent, OFFLINE_START, OFFLINE_STOP, START, STOP


# Known bugs
# Processing of Unknown -> e.g. getting a "Stop" when in Unknown means that Unknown was actually "Start"
# or getting an "online" in unknown means it was "offline".

class ThamesMonitorState(StateMachine):
    unknown = State("Unknown", initial=True)
    online = State("Online")
    offline = State("Offline")
    overflowing = State("Overflowing")
    potentially_overflowing = State("Potentially Overflowing")

    do_online = unknown.to(online) | offline.to(online) | potentially_overflowing.to(online) | online.to(online,
                                                                                                         cond="online_to_online")
    do_offline = unknown.to(offline) | online.to(offline) | overflowing.to(potentially_overflowing) | offline.to(
        offline, cond="offline_to_offline") | potentially_overflowing.to(potentially_overflowing,
                                                                         cond="offline_to_offline")
    do_start = unknown.to(overflowing) | online.to(overflowing) | potentially_overflowing.to(overflowing)
    do_stop = unknown.to(online) | online.to(online) | potentially_overflowing.to(online,
                                                                                  cond="synthetic_stop") | potentially_overflowing.to(
        potentially_overflowing) | overflowing.to(online) | offline.to(offline)

    def __init__(self, cb):
        self.last_event_time = None
        super(ThamesMonitorState, self).__init__()
        self.add_observer(cb)

    def synthetic_stop(self, event_time):
        if self.last_event_time is not None:
            if event_time == self.last_event_time:
                self.last_event_time = None
                return False
        return True

    def on_enter_potentially_overflowing(self, event_time):
        self.last_event_time = event_time

    def offline_to_offline(self, event):
        print(f"Note: offline to offline")
        return True

    def online_to_online(self, event):
        print(f"Note: online to online")
        return True


def monitor(event: TWEvent):
    return event.location_name + "|" + event.permit_number


class ThamesMonitorListener:
    def new(self, permit_id: str):
        raise NotImplementedError

    def transition(self, state: str, at: datetime.datetime):
        raise NotImplementedError


class ThamesEventStream:

    def __init__(self, cb: ThamesMonitorListener):
        self.state = None
        self.monitor = None
        self.state_start = None
        self.cb = cb

    def _next(self, event):
        self.monitor = monitor(event)
        self.state = ThamesMonitorState(self)
        self.cb.new(event.permit_number)

    def event(self, event: TWEvent):

        if self.state is None:
            self._next(event)

        if monitor(event) != self.monitor:
            self._next(event)

        if event.alert_type == OFFLINE_START:
            self.state.do_offline(event_time=event.date_time)
        elif event.alert_type == OFFLINE_STOP:
            self.state.do_online(event_time=event.date_time)
        elif event.alert_type == START:
            self.state.do_start(event_time=event.date_time)
        elif event.alert_type == STOP:
            self.state.do_stop(event_time=event.date_time)

    def on_enter_state(self, event, target, source, event_time):
        # print(f"{target.id} {event_time}")
        self.cb.transition(target.id, event_time)


# we want this as a LocalTime -
def as_naive(d: datetime.datetime) -> datetime.datetime:
    return datetime.datetime(d.year, d.month, d.day, d.hour, d.minute, d.second, d.microsecond)


def row_to_event(row: Any) -> TWEvent:
    return TWEvent(
        location_name=row[0],
        permit_number=row[1],
        location_grid_ref=row[2],
        x=row[3],
        y=row[4],
        receiving_water_course=None,
        alert_type=row[5],
        date_time=as_naive(row[6])
    )


class CalendaringListener(ThamesMonitorListener):

    def __init__(self, start: datetime.date):
        self.monitors: Mapping[str: Calendar] = defaultdict(lambda: Calendar("unknown", start))
        self.current: Optional[Calendar] = None

    def new(self, permit_id: str):
        self.current = self.monitors[permit_id]

    def transition(self, state: str, at: datetime.datetime):
        self.current.add(state, at)

    def things_at(self, on_date: datetime.date):
        dt = at_midnight(on_date)
        for k, v in self.monitors.items():
            v.add("now", dt)
            yield k, v

class DateTimeEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, datetime.datetime):
            return o.isoformat()
        elif isinstance(o, datetime.date):
            return o.isoformat()

        return super().default(o)


class TimeDeltaMinutesEncoder(json.JSONEncoder):

    def default(self, o: Any) -> Any:
        if isinstance(o, datetime.timedelta):
            return int(o.total_seconds() / 60)

        return super().default(o)


class MultipleJsonEncoders(json.JSONEncoder):
    """
    Combine multiple JSON encoders
    """
    def __init__(self, *encoders):
        self.encoders = encoders
        self.args = ()
        self.kwargs = {}

    def default(self, obj):
        for encoder in self.encoders:
            try:
                return encoder(*self.args, **self.kwargs).default(obj)
            except TypeError:
                pass
        raise TypeError(f'Object of type {obj.__class__.__name__} is not JSON serializable')

    def __call__(self, *args, **kwargs):
        self.args = args
        self.kwargs = kwargs
        enc = json.JSONEncoder(*args, **kwargs)
        enc.default = self.default
        return enc


if __name__ == "__main__":

    start_date = datetime.date.fromisoformat("2022-12-01")
    end_date = datetime.date.today()

    listener = CalendaringListener(start_date)

    with psycopg2.connect(host="localhost", database="gis", user="docker", password="docker") as conn:

        stream = ThamesEventStream(listener)

        for event in select_many(
                connection=conn,
                sql="select * from events_thames where date_trunc('day', date_time) >= %s order by permit_number, date_time, case alert_type when 'Offline start' then 1 else 2 end",
                params=(start_date,),
                f=row_to_event):
            stream.event(event)

    j = []

    for permit_id, calendar in listener.things_at(end_date):
        for date, totals in calendar.allocations():
            j.append(
                { "p": permit_id, "d": date, "a": totals }
            )


    with open("bob.json", "w") as bob:
        json.dump(obj=j, fp=bob, cls=MultipleJsonEncoders(DateTimeEncoder,TimeDeltaMinutesEncoder))


    graph = DotGraphMachine(ThamesMonitorState)
    dot = graph()
    dot.write_png("twstate.png")
