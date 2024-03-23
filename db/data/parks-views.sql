
drop view if exists parks_view;

create view parks_view as (
    select 'SSSI-EN' as type, sssi_name as name, wkb_geometry from sites_of_special_scientific_interest_england
    union
    select 'SSSI-WA' as type, sssi_name as name, wkb_geometry from gwc21_site_of_special_scientific_interestpolygon
    union
    select 'AONB-EN' as type, name as name, wkb_geometry from areas_of_outstanding_natural_beauty_england
    union
    select 'AONB-WA' as type, aonb_name as name, wkb_geometry from nrw_aonbpolygon
              )