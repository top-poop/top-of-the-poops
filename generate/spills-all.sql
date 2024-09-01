with cons as (
    select *
    from edm_consent_view edm
             join grid_references grid on edm.effluent_grid_ref = grid.grid_reference
    where reporting_year = 2023
),
    agg as (
        select
            pcon24nm as constituency,
            company_name,
            discharge_site_name as site_name,
            receiving_water,
            lat,
            lon,
            coalesce(sum(spill_count), 0)  as spill_count,
            coalesce(sum(total_spill_hours), 0) as total_spill_hours,
            coalesce(avg(reporting_pct), 0) * 100 as reporting_percent
        from cons
        where pcon24nm is not null
        group by pcon24nm, company_name, discharge_site_name, receiving_water, lat, lon
    )
select * from agg where spill_count > 0 or reporting_percent < 90
order by constituency, total_spill_hours desc
