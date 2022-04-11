select row_number() over () as id,
       edm.shellfishery,
       coalesce(edm.total_spill_hours, 0) as total_spill_hours,
       grid.lat,
       grid.lon,
       grid.pcon20nm
from edm_consent_view as edm
         join grid_references as grid on edm.effluent_grid_ref = grid.grid_reference
where shellfishery is not null
  and reporting_year = 2021
  and total_spill_hours > 0
order by total_spill_hours
;