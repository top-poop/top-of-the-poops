import argparse
import csv
import itertools
import re
from collections import namedtuple

from bodges import process_receiving_water

Consent = namedtuple("Consent", [
    "company_name",
    "discharge_site_name",
    "discharge_site_type_code",
    "dsi_type_description",
    "add_of_discharge_site_line_1",
    "add_of_discharge_site_line_2",
    "add_of_discharge_site_line_3",
    "add_of_discharge_site_line_4",
    "add_of_discharge_site_pcode",
    "district_council",
    "discharge_ngr",
    "catc_name",
    "catchment_code",
    "ea_region",
    "source",
    "permit_number",
    "permit_version",
    "receiving_water",
    "receiving_environ_type_code",
    "rec_env_code_description",
    "issued_date",
    "effective_date",
    "revocation_date",
    "status_of_permit",
    "status_description",
    "outlet_number",
    "outlet_type_code",
    "outlet_type_description",
    "outlet_grid_ref",
    "effluent_number",
    "effluent_type",
    "eff_type_description",
    "effluent_grid_ref"
])

EDM = namedtuple("EDM", [
    "company_name",
    "site_name",
    "consent_id",
    "activity_reference",
    "shellfishery",
    "bathing",
    "total_spill_hours",
    "spill_count",
    "reporting_pct",
    "excuses",
])

ConsentWales = namedtuple("ConsentWales", [
    "permit_holder",
    "discharge_site_name",
    "discharge_site_type_code_description",
    "add_of_discharge_site_line_1",
    "add_of_discharge_site_line_2",
    "add_of_discharge_site_line_3",
    "add_of_discharge_site_town",
    "add_of_discharge_site_postcode",
    "discharge_ngr",
    "local_authority",
    "wfd_waterbody",
    "permit_ref",
    "permit_version",
    "receiving_water",
    "receiving_environ_type_code_description",
    "issued_date",
    "effective_date",
    "revocation_date",
    "status_description",
    "outlet_number",
    "outlet_type_description",
    "outlet_grid_ref",
    "effluent_number",
    "effluent_grid_ref",
    "effluent_type",
    "treatment_code",
    "determinand_code_description",
    "priority_list",
    "season_start",
    "season_end",
    "limit_1",
    "limit_1_definition",
    "limit_2",
    "limit_2_definition",
    "limit_3",
    "limit_3_definition"
])

EDMWales = namedtuple("EDMWales", [
    "site_name",
    "location_grid_ref",
    "permit_number",
    "activity_reference",
    "total_duration_hours",
    "total_count",
    "significant_count",
    "significant_bathing_count",
    "monitoring_pct",
    "edm_operational_years",
    "spill_frequency_trigger"
])

# Looks like this has been extracted from a db, joining a table with permit info
# to a table of treatment/"determinand" so loads of the rows are mostly duplicated
# as a csv file cannot have this kind of relationship

# best guess matching
wales_rec_env_codes = {
    "01: River, stream or ditch": "Freshwater river",
    "06: Canal": "Canal",
    "07: Lake/pond etc with outlet": "Pond/Lake/Reservoir",
    "08: Sewer": "Sewer",
    "09: Saline Estuary": "Estuary/Tidal River",
    "10: Freshwater Estuary": "Estuary/Tidal River",
    "11: Controlled Sea": "Sea",
    "12: Sea Outside Control": "Sea",
    "14: Into Land": "Into land then to watercourse",
}


def map_rec_env_description(wales_rec_env):
    return wales_rec_env_codes.get(wales_rec_env, wales_rec_env)


def map_rec_env_code(wales_rec_env):
    return wales_rec_env.split(":")[0]


def bodge_date(dt):
    if dt == "":
        return dt
    (d, m, y) = re.search(r"(\d+)/(\d+)/(\d+)", dt).groups()
    return f"{y}-{m}-{d}"


def test_bodge_date():
    assert bodge_date("") == ""
    assert bodge_date("18/09/2019") == "2019-09-18"
    assert bodge_date("26/03/2018 23:00:00") == "2018-03-26"


def consent_wales_to_standardised(wales):
    outlet_grid_ref = wales.outlet_grid_ref.replace(" ", "")

    effluent_grid_ref = wales.effluent_grid_ref.replace(" ", "")
    effluent_grid_ref = effluent_grid_ref if effluent_grid_ref else outlet_grid_ref

    return Consent(
        company_name=wales.permit_holder,
        discharge_site_name=wales.discharge_site_name,
        discharge_site_type_code=default,
        dsi_type_description=default,
        add_of_discharge_site_line_1=wales.add_of_discharge_site_line_1,
        add_of_discharge_site_line_2=wales.add_of_discharge_site_line_2,
        add_of_discharge_site_line_3=wales.add_of_discharge_site_line_3,
        add_of_discharge_site_line_4=wales.add_of_discharge_site_town,
        add_of_discharge_site_pcode=wales.add_of_discharge_site_postcode,
        district_council=wales.local_authority,
        discharge_ngr=default,
        catc_name=default,
        catchment_code=default,
        ea_region=default,
        source=default,
        permit_number=wales.permit_ref,
        permit_version=wales.permit_version,
        receiving_water=process_receiving_water(wales.receiving_water),
        receiving_environ_type_code=map_rec_env_code(wales.receiving_environ_type_code_description),
        rec_env_code_description=map_rec_env_description(wales.receiving_environ_type_code_description),
        issued_date=bodge_date(wales.issued_date),
        effective_date=bodge_date(wales.effective_date),
        revocation_date=bodge_date(wales.revocation_date),
        status_of_permit=default,
        status_description=default,
        outlet_number=wales.outlet_number,
        outlet_type_code=default,
        outlet_type_description=wales.outlet_type_description,
        outlet_grid_ref=outlet_grid_ref,
        effluent_number=wales.effluent_number,
        effluent_type=wales.effluent_type,
        eff_type_description=wales.determinand_code_description,
        effluent_grid_ref=effluent_grid_ref,
    )


def bodge_permit(permit):
    permit = re.sub(r"^(NPS|EPR/)", r"", permit)
    return permit


def test_bodge_permit():
    assert bodge_permit("BP0349901") == "BP0349901"
    assert bodge_permit("NPSWQD005458") == "WQD005458"
    assert bodge_permit("EPR/MP3426GY") == "MP3426GY"


def edm_wales_to_standardised(wales):
    hours = 0 if wales.total_duration_hours == "-" else float(wales.total_duration_hours)
    count = 0 if wales.total_count == "-" else float(wales.total_count)

    return EDM(
        company_name="Dwr Cymru Welsh Water",
        site_name=wales.site_name,
        consent_id=bodge_permit(wales.permit_number),
        activity_reference=wales.activity_reference,
        shellfishery="",
        bathing="",
        total_spill_hours=hours,
        spill_count=count,
        reporting_pct=wales.monitoring_pct,
        excuses="",
    )


WELSH_WATER = "Dwr Cymru Welsh Water"

if __name__ == "__main__":

    # to process wales we need E&W file first, as wales and E&W files contain different
    # partially overlapping datasets

    parser = argparse.ArgumentParser(description="run sql script and make json")
    parser.add_argument("--consents", required=True, help="consents file")
    parser.add_argument("--edms", required=True, help="edms file for england and wales")
    parser.add_argument("--wales-edms", required=True, help="edms file for wales")
    parser.add_argument("--to-consents", required=True, default="-", nargs="?", help="output file")
    parser.add_argument("--to-edms", required=True, default="-", nargs="?", help="output file")

    default = "Wales - Default"

    args = parser.parse_args()

    events_in_england_and_wales_file = set()

    with open(args.edms) as ifp:
        input_csv = csv.reader(ifp)
        next(input_csv)

        for row in input_csv:
            edm = EDM._make(row)
            if edm.company_name == WELSH_WATER:
                edm = edm._replace(consent_id=bodge_permit(edm.consent_id))
                events_in_england_and_wales_file.add(edm.consent_id)

    print(f"Have {len(events_in_england_and_wales_file)} ids from the England & Wales File")

    synthetic_consent = {}

    with open(args.wales_edms, encoding='windows-1252') as ifp:
        input_csv = csv.reader(ifp)
        next(input_csv)

        skipped = 0

        with open(args.to_edms, "w") as ofp:
            output_csv = csv.writer(ofp)

            for row in input_csv:
                wales = EDMWales._make(row)

                edm = edm_wales_to_standardised(wales)

                if edm.consent_id in events_in_england_and_wales_file:
                    skipped += 1
                    continue

                if edm.consent_id.startswith("Unpermitted"):
                    synthetic_consent[edm.consent_id] = wales

                output_csv.writerow(edm._asdict().values())

        print(f"Skipped {skipped} entries already in EDM file")

    with open(args.consents, encoding='windows-1252') as ifp:
        input_csv = csv.reader(ifp)
        next(input_csv)

        with open(args.to_consents, "w") as ofp:
            output_csv = csv.writer(ofp)

            for row in input_csv:
                wales = ConsentWales._make(row)
                consent = consent_wales_to_standardised(wales)

                output_csv.writerow(consent._asdict().values())

            for (consent_id, edm) in synthetic_consent.items():
                consent = Consent._make(iterable=itertools.repeat("", 33))
                consent = consent._replace(
                    company_name=WELSH_WATER,
                    permit_number=consent_id,
                    receiving_water="Not Permitted",
                    rec_env_code_description="Not Permitted",
                    discharge_site_name=edm.site_name,
                    effluent_grid_ref=edm.location_grid_ref,
                    outlet_grid_ref=edm.location_grid_ref,
                )
                output_csv.writerow(consent._asdict().values())
