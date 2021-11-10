/*
find nearest constituency, for those points that don't exactly lie within
as constituency boundaries don't include waterways, some rivers/seas lie outside

some grid references given as SV0000000000 which is clearly wrong,
somewhere way in Atlantic, nearish Tresco hence distance < 0.01
 */

with points as (
    select distinct
        effluent_grid_ref as grid_ref,
        st_setsrid(st_point(grid.lon, grid.lat), 4326) as grid_point
    from edm_consent_view edm
             join grid_references grid on grid.grid_reference = edm.effluent_grid_ref
),
     matched as (
         select distinct grid_ref, pcon20nm
         from points
                  join pcon_dec_2020_uk_bfc con on st_covers(wkb_geometry, grid_point)
     ),
     unmatched as (
         select distinct grid_ref, grid_point
         from points
                  left join pcon_dec_2020_uk_bfc con on st_covers(wkb_geometry, grid_point)
         where con.pcon20nm is null
     ),
     distances as (
         select unmatched.grid_ref,
                min(st_distance(wkb_geometry, grid_point)) as min_distance
         from unmatched,
              pcon_dec_2020_uk_bfc con
         group by unmatched.grid_ref
     ),
     closest as (
         select unmatched.grid_ref, con.pcon20nm
         from unmatched
                  join distances on distances.grid_ref = unmatched.grid_ref
                  join pcon_dec_2020_uk_bfc con on st_distance(wkb_geometry, unmatched.grid_point) = distances.min_distance
         where min_distance < 0.1),
     grid_constituency as (
         select grid_ref, pcon20nm from closest
         union
         select grid_ref, pcon20nm from matched
     )
select
    pcon20nm               as constituency,
    concat(mps.first_name,' ',mps.last_name) as mp_name,
    mps.party as mp_party,
    mps.uri as mp_uri,
    edm.company_name           as company,
    sum(edm.spill_count)       as total_spills,
    sum(edm.total_spill_hours) as total_hours
from edm_consent_view edm
         join grid_constituency on edm.effluent_grid_ref = grid_constituency.grid_ref
         left join mps on pcon20nm = mps.constituency
group by pcon20nm, edm.company_name, mps.first_name, mps.last_name, mps.party, mps.uri
order by total_hours desc
