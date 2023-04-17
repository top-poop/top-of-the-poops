
drop view if exists  bathing_view;


create or replace view bathing_view as
select reporting_year,
        edm.bathing,
       company_name,
       count(*) as cso_count,
       sum(edm.total_spill_hours) as total_spill_hours,
       sum(edm.spill_count) as total_spill_count,
       st_x(st_centroid(st_collect(point))) as lon,
       st_y(st_centroid(st_collect(point))) as lat
from edm_consent_view as edm
         join grid_references as grid on edm.effluent_grid_ref = grid.grid_reference
where bathing is not null
group by bathing, company_name, reporting_year;