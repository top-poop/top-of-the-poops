with     reports_2020 as (
         select pcon20nm                                as constituency,
                coalesce(sum(edm.spill_count), 0)       as total_spills,
                coalesce(sum(edm.total_spill_hours), 0) as total_hours
         from edm_consent_view edm
                  join grid_references on edm.effluent_grid_ref = grid_references.grid_reference
         where reporting_year = 2020
           and pcon20nm is not null
         group by reporting_year, pcon20nm, edm.company_name
     ),
     reports_2021 as (
         select pcon20nm                                as constituency,
                coalesce(sum(edm.spill_count), 0)       as total_spills,
                coalesce(sum(edm.total_spill_hours), 0) as total_hours
         from edm_consent_view edm
                  join grid_references on edm.effluent_grid_ref = grid_references.grid_reference
         where reporting_year = 2021
           and pcon20nm is not null
         group by reporting_year, pcon20nm, edm.company_name
     )
select reports_2021.*,
       coalesce(reports_2021.total_spills - reports_2020.total_spills, 0) as spills_increase,
       coalesce(reports_2021.total_hours - reports_2020.total_hours, 0)   as hours_increase,
       concat(mps.first_name, ' ', mps.last_name)                         as mp_name,
       mps.party                                                          as mp_party,
       mps.uri                                                            as mp_uri,
       mps_twitter.screen_name                                            as twitter_handle,
       st_asgeojson(st_simplifypreservetopology(wkb_geometry, 0.005)) as geometry
from reports_2021
         left join reports_2020 on reports_2021.constituency = reports_2020.constituency
         join pcon_dec_2020_uk_bfc con on reports_2021.constituency = con.pcon20nm
         left join mps on reports_2021.constituency = mps.constituency
         left join mps_twitter on mps.constituency = mps_twitter.constituency
order by constituency
