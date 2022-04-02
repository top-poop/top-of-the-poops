with cons as (
    select *
    from edm_consent_view edm
             join grid_references grid on edm.effluent_grid_ref = grid.grid_reference
    where reporting_year = 2021
)
select pcon20nm as constituency, company_name, site_name, receiving_water, lat, lon, sum(spill_count) as spill_count, sum(total_spill_hours) as total_spill_hours
from cons
where spill_count > 0 and pcon20nm is not null
group by pcon20nm, company_name, site_name, receiving_water, lat, lon
order by pcon20nm, company_name, receiving_water
