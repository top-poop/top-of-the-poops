with settings as (select 0.0005 as tolerance)
select pcon20nm                                                           as name,
       mps.first_name, mps.last_name,
       mps_twitter.screen_name,
       st_npoints(wkb_geometry)                                           as points_original,
       st_npoints(st_simplifypreservetopology(wkb_geometry, tolerance))   as points_reduced,
       st_asgeojson(st_simplifypreservetopology(wkb_geometry, tolerance)) as geometry
from pcon_dec_2020_uk_bfc con
    full join settings on 1=1
    left join mps on con.pcon20nm = mps.constituency
    left join mps_twitter on con.pcon20nm = mps_twitter.constituency

