select
       reporting_year,
       company_name,
       receiving_water as river_name,
       coalesce(sum(spill_count),0) as total_count,
       coalesce(sum(total_spill_hours),0) as total_hours
from edm_consent_view
group by reporting_year, company_name, river_name
having sum(spill_count) > 0 and sum(total_spill_hours) > 0
order by reporting_year, total_hours desc, river_name
