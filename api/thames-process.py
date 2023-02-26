import argparse
import os
import pathlib
import re
from collections import defaultdict
from typing import Mapping, Optional

import psycopg2
from statemachine import StateMachine, State
from statemachine.contrib.diagram import DotGraphMachine

from calendar_bucket import Calendar, at_midnight, Summariser
from encoder import *
from psy import select_many
from thames import TWEvent, OFFLINE_START, OFFLINE_STOP, START, STOP


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
        return True

    def online_to_online(self, event):
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


def thames_permit_constituencies(connection):
    return {p: [s, c] for p, s, c in select_many(
        connection=connection,
        sql="""select permit_number, discharge_site_name, pcon20nm
    from consents_unique_view
        join grid_references grid on effluent_grid_ref = grid.grid_reference
    where company_name ilike %s""",
        params=('THAMES WATER%',),
        f=lambda row: (row[0], row[1], row[2])
    )}


def kebabcase(s):
    return "-".join(re.findall(
        r"[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+",
        s.lower()
    ))


if __name__ == "__main__":

    parser = argparse.ArgumentParser(description="Take latest Thames API Results and turn into summary for web")
    parser.add_argument("--output", type=pathlib.Path, default=pathlib.Path("web/data/generated/live/constituencies"),
                        help="directory for output files")
    parser.add_argument("--state", type=pathlib.Path, default=pathlib.Path("api/twstate.png"),
                        help="Write state transitions to file")
    args = parser.parse_args()

    os.makedirs(args.output, exist_ok=True)

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

        permit_to_site_cons = thames_permit_constituencies(conn)

    by_constituency = defaultdict(lambda: {"things": [], "count": 0})
    dates = {}

    summariser = Summariser()

    for permit_id, calendar in listener.things_at(end_date):

        site_cons = [permit_id, "Unknown"]
        if permit_id in permit_to_site_cons:
            site_cons = permit_to_site_cons[permit_id]
        # bit horrible
        if permit_id.replace("EPR/", "EPR") in permit_to_site_cons:
            site_cons = permit_to_site_cons[permit_id.replace("EPR/", "EPR")]

        site = site_cons[0]

        site = site.replace("WASTEWATER TREATMENT WORKS", "WWTW")
        site = site.replace("STORM SEWAGE OVERFLOW", "CSO")
        site = site.replace("STORM OVERFLOW, ", "CSO, ")
        site = site.replace("SEWAGE PUMPING STATION", "SPS")


        constituency = site_cons[1]
        by_constituency[constituency]["count"] += 1

        for date, totals in calendar.allocations():
            if not date in dates:
                dates[date] = None

            by_constituency[constituency]["things"].append(
                {"p": site, "cid": permit_id, "c": constituency, "d": date, "a": summariser.summarise(totals)}
            )

    for constituency, stuff in by_constituency.items():
        with open(args.output / f"{kebabcase(constituency)}.json", "w") as bob:
            json.dump(
                fp=bob,
                indent=2,
                cls=MultipleJsonEncoders(DateTimeEncoder, TimeDeltaMinutesEncoder),
                obj={
                    "data": stuff["things"],
                    "count": stuff["count"],
                    "dates": list(dates.keys())
                },
            )

    with open(args.output / "available.json", "w") as bob:
        json.dump(
            fp=bob,
            indent=2,
            obj=list(sorted(by_constituency.keys()))
        )


    graph = DotGraphMachine(ThamesMonitorState)
    dot = graph()
    dot.write_png(args.state)
