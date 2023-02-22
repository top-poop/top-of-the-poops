import dataclasses
import datetime
import os
from typing import List, Optional, Mapping

import requests
from requests.adapters import HTTPAdapter, Retry


@dataclasses.dataclass(frozen=True)
class Credential:
    client_id: str
    client_secret: str


OFFLINE_START = "Offline start"
OFFLINE_STOP = "Offline stop"
START = "Start"
STOP = "Stop"


@dataclasses.dataclass(frozen=True)
class TWEvent:
    location_name: str
    permit_number: str
    location_grid_ref: str
    x: str
    y: str
    receiving_water_course: Optional[str]
    alert_type: str
    date_time: datetime.datetime


class TWApi:
    def __init__(self, credentials: Credential, baseurl: str = "https://prod-tw-opendata-app.uk-e1.cloudhub.io"):
        self.baseurl = baseurl
        self.session = requests.Session()
        self.session.mount('https://', HTTPAdapter(
            max_retries=(Retry(total=3, backoff_factor=0.5, status_forcelist=[500, 502, 503, 504]))
        ))
        self.session.headers.update({
            "client_id": credentials.client_id,
            "client_secret": credentials.client_secret
        })

    def _url(self, endpoint):
        return f"{self.baseurl}/data/STE/v1/{endpoint}"

    def _do_chunk(self, url: str, params: Mapping[str, str], offset: int):

        request_params = {k: v for k, v in params.items()}
        request_params.update({"offset": offset})

        response = self.session.get(url, params=request_params)
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
            return limit, []

    def _do_chunks(self, url, params):
        items = []
        offset = 0

        while True:
            limit, chunk = self._do_chunk(url, params, offset)
            items.extend(chunk)
            if len(chunk) < limit:
                break
            offset += limit
        return items

    def events(self, on_date: datetime.date) -> List[TWEvent]:
        start_date = on_date
        end_date = on_date + datetime.timedelta(days=1)

        return self._do_chunks(
            url=self._url("DischargeAlerts"),
            params={
                "col_1": "DateTime",
                "operand_1": "gte",
                "value_1": start_date.isoformat(),
                "col_2": "DateTime",
                "operand_2": "lt",
                "value_2": end_date.isoformat()
            }
        )

    def events_by_permit(self, permit_id: str, start_date: datetime.date = None):
        if start_date is None:
            start_date = datetime.date(2022, 12, 1)

        return self._do_chunks(
            url=self._url("DischargeAlerts"),
            params={
                "col_1": "PermitNumber",
                "operand_1": "eq",
                "value_1": permit_id,
                "col_2": "DateTime",
                "operand_2": "gte",
                "value_2": start_date.isoformat()
            }
        )


if __name__ == "__main__":
    api = TWApi(
        Credential(
            os.environ["TW_CLIENT_ID"],
            os.environ["TW_CLIENT_SECRET"]
        )
    )

    # events = api.events(datetime.date.fromisoformat("2023-01-01"))
    events = api.events_by_permit("TEMP.3036")
    print("\n".join([str(e) for e in events]))
    print(f"Len = {len(events)}")
