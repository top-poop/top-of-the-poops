with reports_2021 as (
    select company_name,
           bathing,
           coalesce(sum(spill_count), 0)       as total_count,
           coalesce(sum(total_spill_hours), 0) as total_hours
    from edm
    where bathing is not null
      and reporting_year = 2021
    group by reporting_year, company_name, bathing
),
     reports_2020 as (
         select company_name,
                bathing,
                coalesce(sum(spill_count), 0)       as total_count,
                coalesce(sum(total_spill_hours), 0) as total_hours
         from edm
         where bathing is not null
           and reporting_year = 2020
         group by reporting_year, company_name, bathing
     )
select reports_2021.*,
       coalesce(reports_2021.total_count - reports_2020.total_count,reports_2021.total_count) as spills_increase,
       coalesce(reports_2021.total_hours - reports_2020.total_hours,reports_2021.total_hours) as hours_increase
from reports_2021
left join reports_2020 on reports_2021.company_name = reports_2020.company_name and reports_2021.bathing = reports_2020.bathing
where reports_2021.total_hours > 0 or reports_2021.total_count > 0

order by total_hours desc


