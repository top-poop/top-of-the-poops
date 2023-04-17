drop view if exists bathing_locations_view;

create view bathing_locations_view as
(
with locs as (select site_name as site_name, wkb_geometry as geometry
             from sensitive_areas_bathing_waters
             union
             select bw_name as site_name, wkb_geometry as geometry
             from areas_affecting_bathing_waters where uwwt_sa = 'No'
             union
             select bwname as site_name, wkb_geometry as geometry
             from nrw_uwwtd_sa_bathing_waterspolygon
             where bwname not in (select site_name from sensitive_areas_bathing_waters))
select site_name, geometry from locs
    )