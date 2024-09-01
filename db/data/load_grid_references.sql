-- noinspection SqlWithoutWhere

delete from grid_references;

\copy grid_references from 'download/grid-references.csv' delimiter ',' csv header;


UPDATE grid_references SET point = ST_SETSRID(ST_MakePoint(lon, lat), 4326);

update grid_references set pcon24nm = con.pcon24nm
from pcon_july_2024_uk_bfc con
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
       constituencies.pcon24nm
from grid_references
         cross join lateral (
    select point <-> con.wkb_geometry as distance,
           con.pcon24nm
    from pcon_july_2024_uk_bfc con
    order by distance
    limit 1
    ) constituencies
where grid_references.pcon24nm is null
    and distance < 0.5
;

update grid_references as g set pcon24nm = t.pcon24nm
from t
where g.grid_reference = t.grid_reference;

commit;
