with reports_2020 as (
    select company_name,
           shellfishery,
           coalesce(sum(spill_count), 0)       as total_count,
           coalesce(sum(total_spill_hours), 0) as total_hours,
           avg(reporting_pct)                  as mean_reporting_pct
    from edm
    where shellfishery is not null
      and reporting_year = 2020
    group by company_name, shellfishery
),
     reports_2021 as (
         select company_name,
                shellfishery,
                coalesce(sum(spill_count), 0)       as total_count,
                coalesce(sum(total_spill_hours), 0) as total_hours,
                avg(reporting_pct)                  as mean_reporting_pct
         from edm
         where shellfishery is not null
           and reporting_year = 2021
         group by company_name, shellfishery
     )
select reports_2021.*,
       coalesce(reports_2021.total_count - reports_2020.total_count, reports_2021.total_count) as spills_increase,
       coalesce(reports_2021.total_hours - reports_2020.total_hours, reports_2021.total_hours) as hours_increase
from reports_2021
         left join reports_2020 on reports_2021.company_name = reports_2020.company_name and
                                   reports_2021.shellfishery = reports_2020.shellfishery
order by total_hours desc
