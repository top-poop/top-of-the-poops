
drop view if exists shellfish_view;

create view shellfish_view as (
    select name, wkb_geometry from shellfish_waters_protected_area
    union
    select sfw_name as name, wkb_geometry from water_environment_wfd_shellfish_water_protected_areas_england
)