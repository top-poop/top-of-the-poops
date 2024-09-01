select row_number() over () as id,
       edm.shellfishery as location,
       discharge_site_name,
       reporting_pct * 100 as reporting_percent,
       coalesce(spill_count, 0) as spill_count,
       excuses,
       grid.lat,
       grid.lon,
       grid.pcon24nm
from edm_consent_view as edm
         join grid_references as grid on edm.effluent_grid_ref = grid.grid_reference
where shellfishery is not null
  and reporting_year = 2021
  and reporting_pct * 100 < 90
order by reporting_percent
;