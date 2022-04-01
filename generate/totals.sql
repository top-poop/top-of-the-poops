select reporting_year,
       sum(total_spill_hours) as hours,
       sum(spill_count)       as count
from edm
group by reporting_year