with mappings as (select company_name, consent_company_name, count(*) as edm_count
                  from edm_consent_view
                  group by company_name, consent_company_name),
     company_consents as
         (select mappings.company_name, count(*) as consent_count
          from mappings
                   join consents_unique_view consents on mappings.consent_company_name = consents.company_name
          where consents.revocation_date is null
            and consents.outlet_number = '1'
            and consents.effluent_number = '1'
          group by mappings.company_name)
select reporting_year,
       edm.company_name,
       sum(total_spill_hours) as hours,
       sum(spill_count)       as count,
       count(*)               as location_count,
       consent_count
from edm
         join company_consents on edm.company_name = company_consents.company_name
where total_spill_hours > 0
   or spill_count > 0
group by reporting_year, edm.company_name, consent_count
order by edm.company_name, reporting_year;