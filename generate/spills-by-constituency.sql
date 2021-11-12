
select
    pcon20nm               as constituency,
    concat(mps.first_name,' ',mps.last_name) as mp_name,
    mps.party as mp_party,
    mps.uri as mp_uri,
       mps_twitter.screen_name as twitter_handle,
    edm.company_name           as company,
    sum(edm.spill_count)       as total_spills,
    sum(edm.total_spill_hours) as total_hours
from edm_consent_view edm
         join grid_references on edm.effluent_grid_ref = grid_references.grid_reference
         left join mps on pcon20nm = mps.constituency
         left join mps_twitter on mps.constituency = mps_twitter.constituency
where pcon20nm is not null
group by pcon20nm, edm.company_name, mps.first_name, mps.last_name, mps.party, mps.uri, mps_twitter.screen_name
order by total_hours desc, pcon20nm asc;

