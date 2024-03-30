import csv
import dataclasses
import pathlib
import re
from datetime import timedelta
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
    count_2022: Optional[float]
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
    count_2022: Optional[float]
    count_2021: Optional[float]
    count_2020: Optional[float]
    count_2019: Optional[float]
    count_2018: Optional[float]
    duration_2022: Optional[timedelta]
    duration_2021: Optional[timedelta]
    duration_2020: Optional[timedelta]
    duration_2019: Optional[timedelta]
    duration_2018: Optional[timedelta]
    volume_2022: Optional[float]
    volume_2021: Optional[float]
    volume_2020: Optional[float]
    volume_2019: Optional[float]
    volume_2018: Optional[float]
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


def _fix_duration(d: Any) -> Optional[timedelta]:
    if d == 'No Events':
        return timedelta(seconds=0)
    elif d == 'Not Required':
        return None
    elif d == 'No Data':
        return None
    elif d == 'Not Reported':
        return None
    (h, m, s) = d.split(":")
    return timedelta(hours=int(h), minutes=int(m), seconds=int(s))


def _fix_volume(v) -> Optional[float]:
    if v == 'Not Required':
        return None
    elif v == 'No Data':
        return None
    elif v == 'No Events':
        return 0
    v = v.replace(",", "")
    return float(v)


consent_unknown = {k: None for k in {'discharge_site_type_code', 'dsi_type_description', 'add_of_discharge_site_line_1',
                                     'add_of_discharge_site_line_2', 'add_of_discharge_site_line_3',
                                     'add_of_discharge_site_line_4',
                                     'district_council', 'discharge_ngr', 'catc_name', 'catchment_code',
                                     'ea_region', 'source', 'receiving_environ_type_code', 'rec_env_code_description',
                                     'issued_date',
                                     'effective_date', 'revocation_date', 'status_of_permit', 'status_description',
                                     'outlet_number',
                                     'outlet_type_code', 'outlet_type_description', 'effluent_number', 'effluent_type',
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


def edm_from_summary(reporting_year: int, summary: Any) -> EDM:
    count = summary.count_2022
    duration = summary.duration_2022
    if count is not None:
        spill_count = count
    else:
        spill_count = 0

    if duration is not None:
        total_spill_hours = summary.duration_2022.total_seconds() / 3600.0
    else:
        total_spill_hours = 0

    reporting_pct = availability_from_excuses(summary.comment)

    return EDM(
        reporting_year=reporting_year,
        company_name="Scottish Water",
        site_name=summary.asset_name,
        wasc_site_name=summary.asset_name,
        consent_id=consent_id(summary),
        total_spill_hours=total_spill_hours,
        spill_count=spill_count,
        reporting_pct=reporting_pct,
        excuses=summary.comment,
        **edm_unknown
    )


def read_reported_summaries(path: pathlib.Path) -> List[ReportedSummary]:
    summaries = []

    with open(path) as f:
        f.readline()
        f.readline()
        f.readline()
        f.readline()
        reader = csv.reader(f)
        for row in reader:
            summary = ReportedSummary(*[f.strip() for f in row])

            if summary.licence != '':
                summaries.append(dataclasses.replace(
                    summary,
                    count_2018=_fix_count(summary.count_2018),
                    count_2019=_fix_count(summary.count_2019),
                    count_2020=_fix_count(summary.count_2020),
                    count_2021=_fix_count(summary.count_2021),
                    count_2022=_fix_count(summary.count_2022),
                    duration_2018=_fix_duration(summary.duration_2018),
                    duration_2019=_fix_duration(summary.duration_2019),
                    duration_2020=_fix_duration(summary.duration_2020),
                    duration_2021=_fix_duration(summary.duration_2021),
                    duration_2022=_fix_duration(summary.duration_2022),
                    volume_2018=_fix_volume(summary.volume_2018),
                    volume_2019=_fix_volume(summary.volume_2019),
                    volume_2020=_fix_volume(summary.volume_2020),
                    volume_2021=_fix_volume(summary.volume_2021),
                    volume_2022=_fix_volume(summary.volume_2022),
                    x=int(summary.x),
                    y=int(summary.y)
                ))
    return summaries


def read_nonreported_summaries(path: pathlib.Path) -> List[NonReportedSummary]:
    summaries = []
    with open(path) as f:
        f.readline()
        f.readline()
        f.readline()
        reader = csv.reader(f)

        for row in reader:
            summary = NonReportedSummary(*[f.strip() for f in row])

            if summary.x != '' and summary.y != '':
                summaries.append(
                    dataclasses.replace(
                        summary,
                        count_2022=_fix_count(summary.count_2022),
                        duration_2022=_fix_duration(summary.duration_2022),
                        x=int(summary.x),
                        y=int(summary.y)
                    )
                )

    return summaries


if __name__ == "__main__":
    location = pathlib.Path("provided")

    year = 2022

    reported = read_reported_summaries(location / "scottish-water-reported-summary-2022.csv")
    nonreported = read_nonreported_summaries(location / "scottish-water-nonreported-summary-2022.csv")

    consents = [consent_from_summary(r) for r in reported] + [consent_from_summary(n) for n in nonreported]
    edm = [edm_from_summary(year, r) for r in reported] + [edm_from_summary(year, n) for n in nonreported]

    with consent_writer(location / "scotland-consents.csv") as writer:
        [writer(c) for c in consents]

    with edm_writer(location / "scotland-edms.csv") as writer:
        [writer(e) for e in edm]
