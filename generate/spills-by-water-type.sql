with reports_2020 as (
    select distinct
                    rec_env_code_description as water_type,
                    sum(spill_count)         as total_count,
                    sum(total_spill_hours)   as total_hours
    from edm_consent_view
    where reporting_year = 2020
    group by water_type
),
     reports_2021 as (
         select distinct
                         rec_env_code_description as water_type,
                         sum(spill_count)         as total_count,
                         sum(total_spill_hours)   as total_hours
         from edm_consent_view
         where reporting_year = 2021
         group by water_type
     )
select reports_2021.*,
       reports_2021.total_count - reports_2020.total_count as spills_increase,
       reports_2021.total_hours - reports_2020.total_hours as hours_increase
       from reports_2021
    left join reports_2020 on reports_2021.water_type = reports_2020.water_type
order by total_hours desc;
