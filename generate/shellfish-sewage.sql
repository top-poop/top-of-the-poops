select company_name,
       shellfishery,
       sum(spill_count)       as total_count,
       sum(total_spill_hours) as total_hours
from edm
where shellfishery is not null
group by company_name, shellfishery
order by total_hours desc
