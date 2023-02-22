import datetime
from typing import TypeVar, Any

import psycopg2
from statemachine import StateMachine, State
from statemachine.contrib.diagram import DotGraphMachine

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
                print("Synthetic stop removed")
                return False
        return True

    def on_enter_potentially_overflowing(self, event_time):
        self.last_event_time = event_time

    def offline_to_offline(self, event):
        print(f"Note: offline to offline {event}")
        return True

    def online_to_online(self, event):
        print(f"Note: online to online {event}")
        return True


def monitor(event: TWEvent):
    return event.location_name + "|" + event.permit_number


class ThamesEventStream:

    def __init__(self):
        self.state = None
        self.monitor = None
        self.state_start = None

    def _next(self, event):
        self.monitor = monitor(event)
        print(self.monitor)
        self.state = ThamesMonitorState(self)
        self.state_start = None

    def emit(self):
        print(f"{self.state.current_state.id} from {self.state_start} -> None")

    def event(self, event: TWEvent):

        if self.state is None:
            self._next(event)

        if monitor(event) != self.monitor:
            self.emit()
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
        self.state_start = event_time

    def on_exit_state(self, event, target, source, event_time):
        print(f"{source.id} from {self.state_start} -> {event_time}")


def row_to_event(row: Any) -> TWEvent:
    return TWEvent(
        location_name=row[0],
        permit_number=row[1],
        location_grid_ref=row[2],
        x=row[3],
        y=row[4],
        receiving_water_course=None,
        alert_type=row[5],
        date_time=row[6]
    )


if __name__ == "__main__":

    start_date = datetime.date.fromisoformat("2022-12-01")

    with psycopg2.connect(host="localhost", database="gis", user="docker", password="docker") as conn:

        stream = ThamesEventStream()

        for event in select_many(
                connection=conn,
                sql="select * from events_thames where date_trunc('day', date_time) >= %s order by permit_number, date_time, case alert_type when 'Offline start' then 1 else 2 end",
                params=(start_date,),
                f=row_to_event):
            stream.event(event)

    graph = DotGraphMachine(ThamesMonitorState)
    dot = graph()
    dot.write_png("twstate.png")
