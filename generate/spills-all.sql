with cons as (
    select *
    from edm_consent_view edm
             join grid_references grid on edm.effluent_grid_ref = grid.grid_reference
)
select pcon20nm as constituency, company_name, spill_count, receiving_water, lat, lon
from cons
where spill_count > 0 and pcon20nm is not null
order by pcon20nm, company_name, receiving_water
