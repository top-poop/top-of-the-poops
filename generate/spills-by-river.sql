with reports_2020 as (
    select company_name,
           receiving_water                     as river_name,
           coalesce(sum(spill_count), 0)       as total_count,
           coalesce(sum(total_spill_hours), 0) as total_hours
    from edm_consent_view
    where reporting_year = 2020
    group by reporting_year, company_name, river_name
),
     reports_2021 as (
         select company_name,
                receiving_water                     as river_name,
                coalesce(sum(spill_count), 0)       as total_count,
                coalesce(sum(total_spill_hours), 0) as total_hours
         from edm_consent_view
         where reporting_year = 2021
         group by reporting_year, company_name, river_name
     )
select reports_2021.*,
       coalesce(reports_2021.total_count - reports_2020.total_count,reports_2021.total_count) as spills_increase,
       coalesce(reports_2021.total_hours - reports_2020.total_hours,reports_2021.total_hours) as hours_increase
from reports_2021
         left join reports_2020 on reports_2021.company_name = reports_2020.company_name and
                                   reports_2021.river_name = reports_2020.river_name
where reports_2020.total_count > 0
   or reports_2020.total_hours > 0
   or reports_2021.total_count > 0
   or reports_2021.total_hours > 0
order by total_hours desc, river_name
