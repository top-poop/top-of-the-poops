with cons as (
    select *
    from edm_consent_view edm
             join grid_references grid on edm.effluent_grid_ref = grid.grid_reference
    where reporting_year = 2021
),
    agg as (
        select
            pcon20nm as constituency,
            company_name,
            discharge_site_name as site_name,
            receiving_water,
            lat,
            lon,
            coalesce(sum(spill_count), 0)  as spill_count,
            coalesce(sum(total_spill_hours), 0) as total_spill_hours,
            coalesce(avg(reporting_pct), 0) * 100 as reporting_percent
        from cons
        where pcon20nm is not null
        group by pcon20nm, company_name, discharge_site_name, receiving_water, lat, lon
    )
select * from agg where spill_count > 0 or reporting_percent < 90
order by constituency, company_name, receiving_water
