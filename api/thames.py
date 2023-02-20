import dataclasses
import datetime
import os
from typing import List

import dateutil.tz
import requests


@dataclasses.dataclass(frozen=True)
class Credential:
    client_id: str
    client_secret: str


@dataclasses.dataclass(frozen=True)
class TWEvent:
    location_name: str
    permit_number: str
    location_grid_ref: str
    x: str
    y: str
    receiving_water_course: str
    alert_type: str
    date_time: datetime.datetime


class TWApi:
    def __init__(self, baseurl: str, credentials: Credential):
        self.baseurl = baseurl
        self.session = requests.Session()
        self.session.headers.update({
            "client_id": credentials.client_id,
            "client_secret": credentials.client_secret
        })

    def _url(self, endpoint):
        return f"{self.baseurl}/data/STE/v1/{endpoint}"

    def _events(self, on_date: datetime.date, offset: int):
        url = self._url("DischargeAlerts")

        start_date = on_date
        end_date = on_date + datetime.timedelta(days=1)

        response = self.session.get(url, params={
            "offset": offset,
            "col_1": "DateTime",
            "operand_1": "gte",
            "value_1": start_date.isoformat(),
            "col_2": "DateTime",
            "operand_2": "lt",
            "value_2": end_date.isoformat()
        })
        response.raise_for_status()

        resp = response.json()

        def map_item(i):
            s = i["DateTime"]
            return TWEvent(
                location_name=i["LocationName"],
                permit_number=i["PermitNumber"],
                location_grid_ref=i["LocationGridRef"],
                x=i["X"],
                y=i["Y"],
                receiving_water_course=i["ReceivingWaterCourse"],
                alert_type=i["AlertType"],
                date_time=datetime.datetime.fromisoformat(s)
            )

        limit = int(resp["meta"]["limit"])

        if "items" in resp:
            return limit, [map_item(item) for item in resp["items"]]
        else:
            print(f"No items in response for DischargeAlerts date={on_date}, offset={offset}")
            return limit, []

    def events(self, on_date: datetime.date) -> List[TWEvent]:
        items = []
        offset = 0

        while True:
            limit, chunk = self._events(on_date, offset)
            items.extend(chunk)
            if len(chunk) < limit:
                break
            offset += limit
            print(f"Getting next chunk offset = {offset}")
        return items


if __name__ == "__main__":
    api = TWApi(
        "https://prod-tw-opendata-app.uk-e1.cloudhub.io",
        Credential(
            os.environ["TW_CLIENT_ID"],
            os.environ["TW_CLIENT_SECRET"]
        )
    )

    events = api.events(datetime.date.fromisoformat("2023-01-01"))
    print("\n".join([str(e) for e in events]))
    print(f"Len = {len(events)}")
