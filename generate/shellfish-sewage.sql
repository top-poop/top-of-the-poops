select reporting_year,
       company_name,
       shellfishery,
       sum(spill_count)       as total_count,
       sum(total_spill_hours) as total_hours,
       avg(reporting_pct)     as mean_reporting_pct
from edm
where shellfishery is not null
group by reporting_year, company_name, shellfishery
order by reporting_year, total_hours desc
