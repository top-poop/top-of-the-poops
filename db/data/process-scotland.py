import csv
import dataclasses
import datetime
import pathlib
import re
from datetime import timedelta
from itertools import chain
from typing import Optional, Any, List

import osgb

from edm_types import Consent, EDM, consent_writer, edm_writer


@dataclasses.dataclass(frozen=True)
class NonReportedSummary:
    licence: str
    asset_id: str
    asset_name: str
    measurement_point_desc_uq: str
    sw_area: str
    network_wwtw: str
    overflow_type: str
    postcode: str
    local_authority: str
    x: int
    y: int
    receiving_water: str
    days_data_2023: int
    days_data_2022: int
    count_2023: Optional[float]
    count_2022: Optional[float]
    duration_2023: Optional[timedelta]
    duration_2022: Optional[timedelta]
    comment: str


@dataclasses.dataclass(frozen=True)
class ReportedSummary:
    licence: str
    asset_id: str
    asset_name: str
    measurement_point_desc: str
    measurement_point_desc_uq: str
    sw_area: str
    network_wwtw: str
    overflow_type: str
    bathing_season_only: str
    postcode: str
    local_authority: str
    x: int
    y: int
    receiving_water: str
    days_data_2023: int
    count_2023: Optional[float]
    count_2022: Optional[float]
    count_2021: Optional[float]
    count_2020: Optional[float]
    count_2019: Optional[float]
    duration_2023: Optional[timedelta]
    duration_2022: Optional[timedelta]
    duration_2021: Optional[timedelta]
    duration_2020: Optional[timedelta]
    duration_2019: Optional[timedelta]
    volume_2023: Optional[float]
    volume_2022: Optional[float]
    volume_2021: Optional[float]
    volume_2020: Optional[float]
    volume_2019: Optional[float]
    comment: str


def _fix_count(c) -> Optional[float]:
    if c == 'No Events':
        return 0
    elif c == 'Not Required':
        return None
    elif c == 'No Data':
        return None
    elif c == 'Not Reported':
        return None
    c = c.replace(",", "")
    return float(c)


duration_re = re.compile("(\d+):(\d+):(\d+)")


def _fix_duration(d: Any) -> Optional[timedelta]:
    if d == 'No Events':
        return timedelta(seconds=0)
    elif d == 'Not Required':
        return None
    elif d == 'No Data':
        return None
    elif d == 'Not Reported':
        return None

    result = duration_re.search(d)
    if result is None:
        print(f"Can't find duration out of '{d}'")
        return None

    return timedelta(hours=int(result.group(1)), minutes=int(result.group(2)), seconds=int(result.group(3)))


def _fix_volume(v) -> Optional[float]:
    if v == 'Not Required':
        return None
    elif v == 'No Data':
        return None
    elif v == 'No Events':
        return 0
    v = v.replace(",", "")
    return float(v)


def _fix_days(v) -> int:
    if v == 'Not Required':
        return 0
    return int(v)


consent_unknown = {k: None for k in {'discharge_site_type_code', 'dsi_type_description', 'add_of_discharge_site_line_1',
                                     'add_of_discharge_site_line_2', 'add_of_discharge_site_line_3',
                                     'add_of_discharge_site_line_4',
                                     'district_council', 'discharge_ngr', 'catc_name', 'catchment_code',
                                     'ea_region', 'source', 'receiving_environ_type_code',
                                     'issued_date',
                                     'effective_date', 'revocation_date', 'status_of_permit', 'status_description',
                                     'outlet_type_code', 'outlet_type_description', 'effluent_type',
                                     'eff_type_description'}}


def consent_id(summary: ReportedSummary | NonReportedSummary) -> str:
    return (summary.licence + "-" + summary.asset_id + "-" + summary.overflow_type).replace(" & ", "+")


def consent_from_summary(summary: ReportedSummary | NonReportedSummary) -> Consent:
    return Consent(
        company_name="Scottish Water",
        discharge_site_name=summary.asset_name,
        add_of_discharge_site_pcode=summary.postcode,
        permit_number=consent_id(summary),
        permit_version=1,
        receiving_water=(summary.receiving_water or "Unknown"),
        outlet_grid_ref=osgb.format_grid(summary.x, summary.y, form='SSEEEEENNNNN'),
        effluent_grid_ref=osgb.format_grid(summary.x, summary.y, form='SSEEEEENNNNN'),
        rec_env_code_description = "Freshwater river",
        outlet_number = '1',
        effluent_number = '1',
        **consent_unknown
    )


edm_unknown = {k: None for k in
               {'activity_reference', 'bathing', 'shellfishery', 'wfd_waterbody_id', 'edm_commissioning_info',
                'reporting_low_reason', 'reporting_low_action', 'spill_high_reason',
                'spill_high_action', 'spill_high_planning'}}

e = re.compile(r"Based on (\d+) days")


def availability_from_excuses(c: str) -> float:
    if c is None or c == "":
        return 1.0

    m = e.search(c)
    if m is not None:
        return int(m.group(1)) / 365.0
    else:
        return 0


def duration_to_hours(duration: Optional[datetime.timedelta]) -> float:
    if duration is not None:
        return duration.total_seconds() / 3600.0
    else:
        return 0


def edm_from_summary(summary: ReportedSummary | NonReportedSummary) -> List[EDM]:
    reporting_pct = summary.days_data_2023 / 365.0

    return [
        EDM(
            reporting_year=2022,
            company_name="Scottish Water",
            site_name=summary.asset_name,
            wasc_site_name=summary.asset_name,
            consent_id=consent_id(summary),
            total_spill_hours=duration_to_hours(summary.duration_2022),
            spill_count=summary.count_2022 if summary.count_2022 else 0,
            reporting_pct=reporting_pct,
            excuses=summary.comment,
            **edm_unknown
        ),
        EDM(
            reporting_year=2023,
            company_name="Scottish Water",
            site_name=summary.asset_name,
            wasc_site_name=summary.asset_name,
            consent_id=consent_id(summary),
            total_spill_hours=duration_to_hours(summary.duration_2023),
            spill_count=summary.count_2023 if summary.count_2023 else 0,
            reporting_pct=reporting_pct,
            excuses=summary.comment,
            **edm_unknown
        )
    ]


def read_reported_summaries(path: pathlib.Path) -> List[ReportedSummary]:
    summaries = []

    with open(path) as f:
        reader = csv.reader(f)
        next(reader)
        next(reader)
        for row in reader:
            if row[1] == '':
                break

            summary = ReportedSummary(*[f.strip() for f in row])

            if summary.licence != '':
                summaries.append(dataclasses.replace(
                    summary,
                    count_2019=_fix_count(summary.count_2019),
                    count_2020=_fix_count(summary.count_2020),
                    count_2021=_fix_count(summary.count_2021),
                    count_2022=_fix_count(summary.count_2022),
                    count_2023=_fix_count(summary.count_2023),
                    duration_2019=_fix_duration(summary.duration_2019),
                    duration_2020=_fix_duration(summary.duration_2020),
                    duration_2021=_fix_duration(summary.duration_2021),
                    duration_2022=_fix_duration(summary.duration_2022),
                    duration_2023=_fix_duration(summary.duration_2023),
                    volume_2019=_fix_volume(summary.volume_2019),
                    volume_2020=_fix_volume(summary.volume_2020),
                    volume_2021=_fix_volume(summary.volume_2021),
                    volume_2022=_fix_volume(summary.volume_2022),
                    volume_2023=_fix_volume(summary.volume_2023),
                    x=int(summary.x),
                    y=int(summary.y),
                    days_data_2023=_fix_days(summary.days_data_2023)
                ))
    return summaries


def read_nonreported_summaries(path: pathlib.Path) -> List[NonReportedSummary]:
    summaries = []
    with open(path) as f:
        reader = csv.reader(f)
        next(reader)
        next(reader)

        for row in reader:
            summary = NonReportedSummary(*[f.strip() for f in row])

            if summary.x != '' and summary.y != '':
                summaries.append(
                    dataclasses.replace(
                        summary,
                        count_2022=_fix_count(summary.count_2022),
                        count_2023=_fix_count(summary.count_2023),
                        duration_2022=_fix_duration(summary.duration_2022),
                        duration_2023=_fix_duration(summary.duration_2023),
                        x=int(summary.x),
                        y=int(summary.y),
                        days_data_2023=_fix_days(summary.days_data_2023)
                    )
                )

    return summaries


if __name__ == "__main__":
    location = pathlib.Path("provided")

    reported = read_reported_summaries(location / "scottish-water-reported-summary-2023.csv")
    nonreported = read_nonreported_summaries(location / "scottish-water-nonreported-summary-2023.csv")

    consents = [consent_from_summary(r) for r in reported] + [consent_from_summary(n) for n in nonreported]
    edm = chain.from_iterable([edm_from_summary(r) for r in reported] + [edm_from_summary(n) for n in nonreported])

    with consent_writer(location / "scotland-consents.csv") as writer:
        [writer(c) for c in consents]

    with edm_writer(location / "scotland-edms.csv") as writer:
        [writer(e) for e in edm]
