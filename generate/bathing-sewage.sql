select reporting_year,
       company_name,
       bathing,
       sum(spill_count)       as total_count,
       sum(total_spill_hours) as total_hours
from edm
where bathing is not null
group by reporting_year, company_name, bathing
having sum(total_spill_hours) > 0
order by reporting_year asc, total_hours desc
