select
    distinct rec_env_code_description as water_type, sum(spill_count) as total_count, sum(total_spill_hours) as total_hours
from edm_consent_view
group by water_type
order by total_hours desc;
