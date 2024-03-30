import contextlib
import csv
import dataclasses
import pathlib
from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class EDM:
    reporting_year: int
    company_name: str
    site_name: str
    wasc_site_name: str
    consent_id: str
    activity_reference: str
    bathing: str
    shellfishery: str
    total_spill_hours: float
    spill_count: int
    reporting_pct: float
    wfd_waterbody_id: Optional[str]
    excuses: str
    edm_commissioning_info: str
    reporting_low_reason: str
    reporting_low_action: str
    spill_high_reason: str
    spill_high_action: str
    spill_high_planning: str


@dataclass(frozen=True)
class Consent:
    company_name: str
    discharge_site_name: str
    discharge_site_type_code: str
    dsi_type_description: str
    add_of_discharge_site_line_1: str
    add_of_discharge_site_line_2: str
    add_of_discharge_site_line_3: str
    add_of_discharge_site_line_4: str
    add_of_discharge_site_pcode: str
    district_council: str
    discharge_ngr: str
    catc_name: str
    catchment_code: str
    ea_region: str
    source: str
    permit_number: str
    permit_version: str
    receiving_water: str
    receiving_environ_type_code: str
    rec_env_code_description: str
    issued_date: str
    effective_date: str
    revocation_date: str
    status_of_permit: str
    status_description: str
    outlet_number: str
    outlet_type_code: str
    outlet_type_description: str
    outlet_grid_ref: str
    effluent_number: str
    effluent_type: str
    eff_type_description: str
    effluent_grid_ref: str


@contextlib.contextmanager
def edm_writer(output: pathlib.Path):
    with open(output, "w") as out:
        writer = csv.DictWriter(out, ["reporting_year", "company_name",
                                      "site_name",
                                      "wasc_site_name",
                                      "consent_id",
                                      "activity_reference",
                                      "shellfishery",
                                      "bathing",
                                      "total_spill_hours",
                                      "spill_count",
                                      "reporting_pct",
                                      "wfd_waterbody_id",
                                      "excuses",
                                      "edm_commissioning_info",
                                      "reporting_low_reason",
                                      "reporting_low_action",
                                      "spill_high_reason",
                                      "spill_high_action",
                                      "spill_high_planning"
                                      ])

        writer.writeheader()
        yield lambda edm: writer.writerow(dataclasses.asdict(edm))

@contextlib.contextmanager
def consent_writer(output: pathlib.Path):
    with open(output, "w") as out:

        writer = csv.DictWriter(out, [f.name for f in dataclasses.fields(Consent)])
        writer.writeheader()

        yield lambda consent: writer.writerow(dataclasses.asdict(consent))
