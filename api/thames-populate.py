import argparse
import datetime
import os
from time import sleep

import psycopg2
import requests as requests

from api.psy import select_one
from api.thames import TWApi, Credential

class DateArgAction(argparse.Action):
    def __call__(self, parser, namespace, values, option_string=None):
        setattr(namespace, self.dest, datetime.date.fromisoformat(values))


def process_date(connection, on_date):
    print(f"Date - {on_date} ..", end="")
    with connection.cursor() as cursor:
        cursor.execute("delete from events_thames where date_trunc('day', date_time) = %s", (on_date,))

        events = api.events(on_date)
        print(f". {len(events)}")
        for event in events:
            row = (event.location_name, event.permit_number, event.location_grid_ref, event.x, event.y,
                   event.alert_type, event.date_time)
            cursor.execute(
                "insert into events_thames(location_name, permit_number, location_grid_reference, "
                "x, y, alert_type, date_time) values (%s, %s, %s, %s, %s, %s, %s)",
                row
            )
        connection.commit()


if __name__ == "__main__":

    parser = argparse.ArgumentParser(description="Populate events from Thames Water")
    parser.add_argument("--update", action="store_true", help="Run in update mode")
    parser.add_argument("--reset", action="store_true", help="Delete everything and redownload")
    parser.add_argument("--date", action=DateArgAction, help="load a single date yyyy-mm-dd")
    parser.add_argument("--to", action=DateArgAction, help="to date yyyy-mm-dd (when using --date)")

    args = parser.parse_args()

    if args.update is None and args.reset is None and args.date is None:
        raise ValueError("Need one of --update --reset or --date <date>")

    api = TWApi(
        Credential(
            os.environ["TW_CLIENT_ID"],
            os.environ["TW_CLIENT_SECRET"]
        )
    )

    start_date = datetime.date(2022, 12, 1)
    end_date = datetime.date.today()
    a_day = datetime.timedelta(days=1)


    with psycopg2.connect(host="localhost", database="gis", user="docker", password="docker") as conn:

        if args.update:
            d: datetime.datetime = select_one(conn, "select max(date_time) from events_thames")[0]
            if d is not None:
                start_date = d.date() + a_day

        if args.reset:
            pass

        if args.date:
            start_date = args.date
            end_date = start_date + a_day
            if args.to:
                end_date = args.to
            if end_date < start_date:
                raise ValueError("End Date must be before start date")



        print(f"Start date is {start_date}, end date is {end_date}")
        if start_date == end_date:
            print("Nothing to do")
            exit(0)

        current_date = start_date

        try:
            while current_date < end_date:
                process_date(conn, current_date)
                current_date = current_date + a_day
                sleep(2)
        except requests.exceptions.HTTPError as e:
            print(f"API Failed: {e}" )
            print(f"Request URL= {e.response.url}" )
            print(f"Response: {e.response.text}")


