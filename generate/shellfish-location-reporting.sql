select row_number() over () as id,
       edm.shellfishery,
       floor(reporting_pct * 100) as reporting_percent,
       grid.lat,
       grid.lon,
       grid.pcon20nm
from edm_consent_view as edm
         join grid_references as grid on edm.effluent_grid_ref = grid.grid_reference
where shellfishery is not null
  and reporting_year = 2021
  and floor(reporting_pct * 100) < 90
order by reporting_percent
;