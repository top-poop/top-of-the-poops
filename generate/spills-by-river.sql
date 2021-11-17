select
       company_name,
       receiving_water as river_name,
       sum(spill_count) as total_count,
       sum(total_spill_hours) as total_hours
from edm_consent_view
group by company_name, river_name
having sum(spill_count) > 0 and sum(total_spill_hours) > 0
order by total_hours desc, river_name
