with settings as (select 0.0005 as tolerance)
select pcon24nm                                                           as name,
       mps.first_name, mps.last_name,
       mps_twitter.screen_name,
       st_npoints(wkb_geometry)                                           as points_original,
       st_npoints(st_simplifypreservetopology(wkb_geometry, tolerance))   as points_reduced,
       st_asgeojson(st_forcepolygoncw(st_simplifypreservetopology(wkb_geometry, tolerance))) as geometry
from pcon_july_2024_uk_bfc con
    full join settings on 1=1
    left join mps on con.pcon24nm = mps.constituency
    left join mps_twitter on con.pcon24nm = mps_twitter.constituency

