/*
 just some sql to keep around
 */

-- find nearest constituency, for those points that don't exactly lie within
-- as constituency boundaries don't include waterways, some rivers/seas lie outside

with unmatched as (
    select distinct edm.consent_id, c.effluent_grid_ref, grid.lat, grid.lon
    from edm
             join edm_consent_view c on edm.consent_id = c.permit_number
             join grid_references grid on grid.grid_reference = c.effluent_grid_ref
             left join pcon_dec_2020_uk_bfc con on st_covers(wkb_geometry, st_setsrid(st_point(grid.lon, grid.lat), 4326))
    where con.pcon20nm is null),
     min_distances as (
         select consent_id, effluent_grid_ref, min(st_distance(wkb_geometry, st_setsrid(st_point(grid.lon, grid.lat), 4326))) as min_distance
         from unmatched, pcon_dec_2020_uk_bfc con, grid_references grid
         where grid.grid_reference = effluent_grid_ref
         group by consent_id, effluent_grid_ref
     )
select unmatched.consent_id, unmatched.effluent_grid_ref, con.pcon20nm from unmatched
                  join min_distances on min_distances.consent_id = unmatched.consent_id
                  join pcon_dec_2020_uk_bfc con on st_distance(wkb_geometry, st_setsrid(st_point(unmatched.lon, unmatched.lat), 4326)) = min_distances.min_distance
where min_distance < 0.1
union
select c.consent_id, c.effluent_grid_ref, con.pcon20nm
from edm_consent_view c
         join grid_references grid on grid.grid_reference = c.effluent_grid_ref
         join pcon_dec_2020_uk_bfc con on st_covers(wkb_geometry, st_setsrid(st_point(grid.lon, grid.lat), 4326))

/* some grid references given as SV0000000000 which is clearly wrong, somewhere way in Atlantic, nearish Tresco  */

