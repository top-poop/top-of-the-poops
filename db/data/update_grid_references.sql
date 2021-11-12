alter table grid_references
    add column
        point GEOMETRY(point, 4326);

-- noinspection SqlWithoutWhere

UPDATE grid_references
SET point = ST_SETSRID(ST_MakePoint(lon, lat), 4326);

alter table grid_references
    add column
        pcon20nm text;

update grid_references set pcon20nm = con.pcon20nm
from pcon_dec_2020_uk_bfc con
 where st_covers(wkb_geometry, point);

/*
find nearest constituency, for those points that don't exactly lie within
as constituency boundaries don't include waterways, some rivers/seas lie outside

some grid references given as SV0000000000 which is clearly wrong,
somewhere way in Atlantic, nearish Tresco hence distance < 0.01
 */

/* next bit takes about 3 mins on dev env - why so slow? */

begin;

create temporary table t on commit drop as
    with
     distances as (
         select grid_reference,
                min(st_distance(wkb_geometry, point)) as min_distance
         from grid_references,
              pcon_dec_2020_uk_bfc con
         where grid_references.pcon20nm is null
         group by grid_reference
     ),
     closest as (
         select g.grid_reference, con.pcon20nm
         from grid_references g
                  join distances on distances.grid_reference = g.grid_reference
                  join pcon_dec_2020_uk_bfc con on st_distance(wkb_geometry, point) = distances.min_distance
         where g.pcon20nm is null and min_distance < 0.1)
select grid_reference, pcon20nm
from closest;

update grid_references as g set pcon20nm = t.pcon20nm
from t
where g.grid_reference = t.grid_reference;

commit;
