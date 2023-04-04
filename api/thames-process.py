import argparse
import os
import pathlib
import re
from collections import defaultdict
from typing import Mapping, Optional

import psycopg2
import statemachine.exceptions
from statemachine.contrib.diagram import DotGraphMachine

from calendar_bucket import Calendar, at_midnight, Summariser
from encoder import *
from psy import select_many
from thames import TWEvent, OFFLINE_START, OFFLINE_STOP, START, STOP, ThamesMonitorState


def monitor(event: TWEvent):
    return event.location_name + "|" + event.permit_number


class ThamesMonitorListener:
    def new(self, permit_id: str):
        raise NotImplementedError

    def transition(self, state: str, at: datetime.datetime):
        raise NotImplementedError


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

        try:
            if event.alert_type == OFFLINE_START:
                self.state.do_offline(event_time=event.date_time)
            elif event.alert_type == OFFLINE_STOP:
                self.state.do_online(event_time=event.date_time)
            elif event.alert_type == START:
                self.state.do_start(event_time=event.date_time)
            elif event.alert_type == STOP:
                self.state.do_stop(event_time=event.date_time)
        except statemachine.exceptions.TransitionNotAllowed:
            raise IOError(f"Illegal state transition processing {event}")

    def on_enter_state(self, event, target, source, event_time):
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


def thames_permit_constituencies(connection):
    return {p: [s, c] for p, s, c in select_many(
        connection=connection,
        sql="""select permit_number, discharge_site_name, pcon20nm from consents_unique_view join grid_references grid on effluent_grid_ref = grid.grid_reference where company_name ilike %s""",
        params=('THAMES WATER%',),
        f=lambda row: (row[0], row[1], row[2])
    )}


def kebabcase(s):
    return "-".join(re.findall(
        r"[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+",
        s.lower()
    ))


def aggregate_thames_events(connection):
    listener = CalendaringListener(start_date)
    stream = ThamesEventStream(listener)

    for event in select_many(
            connection=connection,
            sql="select * from events_thames where date_trunc('day', date_time) >= %s order by permit_number, date_time, case alert_type when 'Offline start' then 1 else 2 end",
            params=(start_date,),
            f=row_to_event):
        stream.event(event)
    return listener


def insert_thames_summary(connection, permit_id, calendar):
    with connection.cursor() as cursor:
        for date, totals in calendar.allocations():
            cursor.execute(
                """insert into summary_thames ( permit_id, date, unknown, online, overflowing, potentially_overflowing, offline) 
                values ( %s, %s, %s, %s, %s, %s, %s) 
                on conflict (permit_id, date) 
                do update set unknown = excluded.unknown, online = excluded.online, overflowing = excluded.overflowing, 
                potentially_overflowing = excluded.potentially_overflowing, offline = excluded.offline""",
                (permit_id, date, totals.unknown, totals.online, totals.overflowing, totals.potentially_overflowing,
                 totals.offline))
    connection.commit()


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

    with psycopg2.connect(host="localhost", database="gis", user="docker", password="docker") as conn:

        csos = aggregate_thames_events(connection=conn)
        permit_to_site_cons = thames_permit_constituencies(connection=conn)

        by_constituency = defaultdict(lambda: {"cso": [], "rainfall": [], "count": 0})
        dates = {}

        summariser = Summariser()

        for permit_id, calendar in csos.things_at(end_date):

            site_consent = [permit_id, "Unknown"]
            if permit_id in permit_to_site_cons:
                site_consent = permit_to_site_cons[permit_id]
            # bit horrible
            if permit_id.replace("EPR/", "EPR") in permit_to_site_cons:
                site_consent = permit_to_site_cons[permit_id.replace("EPR/", "EPR")]

            site = site_consent[0]

            site = site.replace("WASTEWATER TREATMENT WORKS", "WWTW")
            site = site.replace("STORM SEWAGE OVERFLOW", "CSO")
            site = site.replace("STORM OVERFLOW, ", "CSO, ")
            site = site.replace("SEWAGE PUMPING STATION", "SPS")

            constituency = site_consent[1]
            by_constituency[constituency]["count"] += 1

            insert_thames_summary(conn, permit_id, calendar)

    graph = DotGraphMachine(ThamesMonitorState)
    dot = graph()
    dot.write_png(args.state)
