import contextlib
import csv
import dataclasses
from dataclasses import dataclass


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
    excuses: str
    edm_commissioning_info: str
    reporting_low_reason: str
    reporting_low_action: str
    spill_high_reason: str
    spill_high_action: str
    spill_high_planning: str


@contextlib.contextmanager
def edm_writer(output):
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



