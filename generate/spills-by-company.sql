select company_name, sum(total_spill_hours) as hours, sum(spill_count) as count
from edm
group by company_name
order by company_name;