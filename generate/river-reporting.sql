select row_number() over () as id,
       edm.receiving_water as location,
       discharge_site_name,
       coalesce(spill_count, 0) as spill_count,
       reporting_pct * 100 as reporting_percent,
       excuses,
       grid.lat,
       grid.lon,
       grid.pcon20nm
from edm_consent_view as edm
         join grid_references as grid on edm.effluent_grid_ref = grid.grid_reference
where receiving_water is not null and bathing is null and shellfishery is null
  and reporting_year = 2021
  and reporting_pct * 100 < 50
  and coalesce(excuses, '') not like 'No longer operational%'
order by reporting_percent
;