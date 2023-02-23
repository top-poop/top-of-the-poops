import os
from time import sleep

import psycopg2

from psy import select_many
from thames import TWApi, Credential

select = """select consent_id from edm_consent_view
where company_name = 'Thames Water'
and reporting_year = '2021'
and not exists (
    select 1 from events_thames where edm_consent_view.permit_number = events_thames.permit_number
    )"""

if __name__ == "__main__":

    api = TWApi(
        Credential(
            os.environ["TW_CLIENT_ID"],
            os.environ["TW_CLIENT_SECRET"]
        )
    )

    ok = True

    with psycopg2.connect(host="localhost", database="gis", user="docker", password="docker") as conn:

        # After populating db with all events, double check by permit id if there are any missing
        for consent_id in select_many(conn, select, f=lambda row: row[0]):
            events = api.events_by_permit(permit_id=consent_id)
            if len(events) > 0:
                ok = False
            print(f"{consent_id} -> {len(events)}")
            sleep(0.5)

    if not ok:
        print("Some CSOs had events, but we thought they should not?")
        exit(1)
