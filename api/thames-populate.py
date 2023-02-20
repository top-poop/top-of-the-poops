import argparse
import datetime
import os
from time import sleep

import psycopg2

from api import thames
from api.thames import TWApi, Credential


def select(connection, sql, params=None):
    with connection.cursor() as cursor:
        cursor.execute(sql, params)
        return cursor.fetchall()


def select_one(connection, sql, params=None):
    with connection.cursor() as cursor:
        cursor.execute(sql, params)
        return cursor.fetchone()


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
    parser.add_argument("--date", help="load a single date yyyy-mm-dd")

    args = parser.parse_args()

    if args.update is None and args.reset is None and args.date is None:
        raise ValueError("Need one of --update --reset or --date <date>")

    api = TWApi(
        "https://prod-tw-opendata-app.uk-e1.cloudhub.io",
        Credential(
            os.environ["TW_CLIENT_ID"],
            os.environ["TW_CLIENT_SECRET"]
        )
    )

    start_date = datetime.date(2023, 1, 1)
    end_date = datetime.date.today()

    with psycopg2.connect(host="localhost", database="gis", user="docker", password="docker") as conn:

        if args.update:
            d: datetime.datetime = select_one(conn, "select max(date_time) from events_thames")[0]
            if d is not None:
                start_date = d.date()

        if args.reset:
            pass

        if args.date:
            start_date = datetime.date.isoformat(args.date)
            end_date = start_date + datetime.timedelta(days=1)

        print(f"Start date is {start_date}")
        current_date = start_date

        while current_date < end_date:
            process_date(conn, current_date)
            current_date = current_date + datetime.timedelta(days=1)
            sleep(2)
