drop view if exists edm_consent_view;
drop view if exists edm_consents_view;

/*
 consent table has some duplicate rows, where a consent has multiple outlets or effluents
 this causes problems when joining on consent id, so just remove the duplicates, and assign
 location of the spill to the the first consent
 */

create view edm_consent_view as
with duplicate_consents as (
    select count(*) over (partition by consents.permit_number)                as count,
           row_number() over (partition by consents.permit_number order by revocation_date desc nulls first) as rn,
           consents.*
    from consents
),
     unique_consents as (
         select *
         from duplicate_consents
         where rn = 1
     )
select edm.company_name, site_name, consent_id, activity_reference, shellfishery, bathing, total_spill_hours, spill_count, reporting_pct, excuses,
       count, rn, discharge_site_name, discharge_site_type_code, dsi_type_description, add_of_discharge_site_line_1, add_of_discharge_site_line_2, add_of_discharge_site_line_3, add_of_discharge_site_line_4, add_of_discharge_site_pcode, district_council, discharge_ngr, catc_name, catchment_code, ea_region, source, permit_number, permit_version, receiving_water, receiving_environ_type_code, rec_env_code_description, issued_date, effective_date, revocation_date, status_of_permit, status_description, outlet_number, outlet_type_code, outlet_type_description, outlet_grid_ref, effluent_number, effluent_type, eff_type_description, effluent_grid_ref
from edm
         join unique_consents as c on edm.consent_id = c.permit_number;
