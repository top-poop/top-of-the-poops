select company_name,
       bathing,
       sum(spill_count)       as total_count,
       sum(total_spill_hours) as total_hours
from edm
where bathing is not null
group by company_name, bathing
having sum(total_spill_hours) > 0
order by total_hours desc
