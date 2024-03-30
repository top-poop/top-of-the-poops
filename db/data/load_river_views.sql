drop view if exists rivers;

drop index if exists nrw_wfd_riverwaterbodies_c1line_ea_id_idx;
create index nrw_wfd_riverwaterbodies_c1line_ea_id_idx on nrw_wfd_riverwaterbodies_c1line ( ea_wb_id );

drop index if exists  wfd_river_water_bodies_cycle_1_ea_id_idx;
create index wfd_river_water_bodies_cycle_1_ea_id_idx on wfd_river_water_bodies_cycle_1 (ea_wb_id );

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
