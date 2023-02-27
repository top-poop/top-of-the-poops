import csv
import dataclasses
import datetime
import gzip
import io
import pathlib
import re
from typing import Optional, Iterable

import requests
from requests.adapters import HTTPAdapter, Retry


# There are other items in the response, but almost all are empty-> pointless
@dataclasses.dataclass(frozen=True)
class RainfallStation:
    station_reference: str
    lat: float
    lon: float


def maybe_date(s: Optional[str]) -> Optional[datetime.date]:
    return datetime.date.fromisoformat(s) if s is not None else None


def to_station(d) -> RainfallStation:
    return RainfallStation(
        d["stationReference"],
        d["lat"],
        d["long"]
    )


@dataclasses.dataclass(frozen=True)
class RainfallReading:
    station_reference: str
    date_time: datetime.datetime
    mm: float


station_re = re.compile("measures/(.+)-rainfall-tipping_bucket_raingauge")


def to_reading(row) -> RainfallReading:
    station = station_re.search(row["measure"]).group(1)

    value = row["value"]
    if '|' in value:
        value = value.split("|")[-1]

    return RainfallReading(
        station,
        datetime.datetime.fromisoformat(row["dateTime"].replace("Z", "+00:00")),
        float(value)
    )


class EnvironmentAgencyAPI:

    def __init__(self, cache_dir: pathlib.Path, baseurl="https://environment.data.gov.uk/flood-monitoring/"):
        self.baseurl = baseurl
        self.cache_dir = cache_dir
        self.session = requests.Session()
        self.session.mount('https://', HTTPAdapter(
            max_retries=(Retry(total=3, backoff_factor=0.5, status_forcelist=[500, 502, 503, 504]))
        ))

    def stations(self) -> Iterable[RainfallStation]:
        uri = f"{self.baseurl}/id/stations"
        response = self.session.get(uri, params={"parameter": "rainfall", "_view": "full"})
        response.raise_for_status()

        for item in response.json()["items"]:
            if "lat" in item:
                try:
                    station = to_station(item)
                    if not station.station_reference.endswith("____"):
                        yield station
                except KeyError:
                    print(item)
                    raise

    def readings(self, date: datetime.date) -> Iterable[RainfallReading]:

        cache_file = self.cache_dir / f"{date.isoformat()}.csv.gz"

        if cache_file.exists():
            print(f"{date} - cached")
            with io.TextIOWrapper(gzip.open(cache_file)) as g:
                text = g.read()
        else:
            print(f"{date} - loading")
            uri = f"{self.baseurl}/archive/readings-{date.isoformat()}.csv"
            response = self.session.get(
                uri,
            )
            response.raise_for_status()
            text = response.text
            with io.TextIOWrapper(gzip.open(cache_file, "wb")) as g:
                g.write(text)

        csv_file = csv.DictReader(text.split("\n"))
        for row in csv_file:
            if row["measure"].endswith("rainfall-tipping_bucket_raingauge-t-15_min-mm"):
                yield to_reading(row)


if __name__ == "__main__":
    cache_dir = pathlib.Path("~/.gis-cache").expanduser()
    cache_dir.mkdir(exist_ok=True)
    api = EnvironmentAgencyAPI(cache_dir)
    # stations = .stations()
    # print("\n".join([str(s) for s in stations]))

    readings = api.readings(datetime.date.fromisoformat("2022-07-01"))
    print("\n".join([str(s) for s in readings]))
