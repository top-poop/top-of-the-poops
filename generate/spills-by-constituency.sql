/*
 consent table has some duplicate rows, where a consent has multiple outlets or effluents
 this causes problems when joining on consent id, so just remove the duplicates, and assign
 location of the spill to the the first consent
 */

with duplicate_consents as (
    select count(*) over (partition by consents.permit_number)                as count,
           row_number() over (partition by consents.permit_number order by 1) as rn,
           consents.*
    from consents
),
     unique_consents as (
         select *
         from duplicate_consents
         where rn = 1
     )
select con.pcon20nm               as constituency,
       concat(mps.first_name,' ',mps.last_name) as mp_name,
       mps.party as mp_party,
       mps.uri as mp_uri,
       edm.company_name           as company,
       sum(edm.spill_count)       as total_spills,
       sum(edm.total_spill_hours) as total_hours
from edm
         join unique_consents c on edm.consent_id = c.permit_number
         join grid_references grid on grid.grid_reference = c.effluent_grid_ref
         join pcon_dec_2020_uk_bfc con on st_covers(wkb_geometry, st_setsrid(st_point(grid.lon, grid.lat), 4326))
         left join mps on con.pcon20nm = mps.constituency
group by con.pcon20nm, edm.company_name, mps.first_name, mps.last_name, mps.party, mps.uri
order by total_hours desc
