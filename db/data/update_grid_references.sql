alter table grid_references
    add column
        point GEOMETRY(point, 4326);

-- noinspection SqlWithoutWhere

UPDATE grid_references
SET point = ST_SETSRID(ST_MakePoint(lon, lat), 4326);

create index grid_ref_point_idx on grid_references using gist(point);

alter table grid_references
    add column
        pcon20nm text;

alter table grid_references
    add column
        ctyua21nm text;

update grid_references set pcon20nm = con.pcon20nm
from pcon_dec_2020_uk_bfc con
 where st_covers(wkb_geometry, point);

update grid_references set ctyua21nm = cty.ctyua21nm
from ctyua_dec_2021_uk_buc cty
where st_covers(wkb_geometry, point);

/*
find nearest constituency, for those points that don't exactly lie within
as constituency boundaries don't include waterways, some rivers/seas lie outside

some grid references given as SV0000000000 which is clearly wrong,
somewhere way in Atlantic, nearish Tresco hence distance < 0.01
 */

/* wow - nearest neighbour in postgis is very cool https://www.postgis.net/workshops/postgis-intro/knn.html */

begin;

create temporary table t on commit drop as
select grid_references.grid_reference,
       constituencies.distance,
       constituencies.pcon20nm
from grid_references
         cross join lateral (
    select point <-> con.wkb_geometry as distance,
           con.pcon20nm
    from pcon_dec_2020_uk_bfc con
    order by distance
    limit 1
    ) constituencies
where grid_references.pcon20nm is null
    and distance < 0.5
;

update grid_references as g set pcon20nm = t.pcon20nm
from t
where g.grid_reference = t.grid_reference;

commit;


/* same again for counties */

begin;

create temporary table u on commit drop as
select grid_references.grid_reference,
       counties.distance,
       counties.ctyua21nm
from grid_references
         cross join lateral (
    select point <-> cty.wkb_geometry as distance, cty.ctyua21nm
    from ctyua_dec_2021_uk_buc cty
    order by distance
    limit 1
    ) counties
where grid_references.ctyua21nm is null
  and distance < 0.5
;

update grid_references as g set ctyua21nm = u.ctyua21nm
from u
where g.grid_reference = u.grid_reference;

commit;


