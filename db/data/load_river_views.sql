drop view if exists rivers;

create view rivers as
with everything as (
    (select 'Wales' as source, ea_wb_id, name, water_cat, rbd_name, wkb_geometry
     from nrw_wfd_riverwaterbodies_c1line
     union
     select 'England' as source, ea_wb_id, name, water_cat, rbd_name, wkb_geometry
     from wfd_river_water_bodies_cycle_1)
        order by ea_wb_id),
     has_duplicated as (select row_number() over (partition by ea_wb_id) as rn, *
                        from everything)
select *
from has_duplicated
where rn = 1
order by ea_wb_id
