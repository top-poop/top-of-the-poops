select
    distinct reporting_year, rec_env_code_description as water_type, sum(spill_count) as total_count, sum(total_spill_hours) as total_hours
from edm_consent_view
group by reporting_year, water_type
order by reporting_year, total_hours desc;
