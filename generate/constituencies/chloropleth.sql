with     reports_2020 as (
         select pcon20nm                                as constituency,
                coalesce(sum(edm.spill_count), 0)       as total_spills,
                coalesce(sum(edm.total_spill_hours), 0) as total_hours,
                count(*)                                as cso_count
         from edm_consent_view edm
                  join grid_references on edm.effluent_grid_ref = grid_references.grid_reference
         where reporting_year = 2020
           and pcon20nm is not null
         group by reporting_year, pcon20nm
     ),
     reports_2021 as (
         select pcon20nm                                as constituency,
                coalesce(sum(edm.spill_count), 0)       as total_spills,
                coalesce(sum(edm.total_spill_hours), 0) as total_hours,
                count(*)                                as cso_count
         from edm_consent_view edm
                  join grid_references on edm.effluent_grid_ref = grid_references.grid_reference
         where reporting_year = 2021
           and pcon20nm is not null
         group by reporting_year, pcon20nm
     )
select
    con.pcon20nm as constituency,
    coalesce(reports_2021.total_spills, 0) as total_spills,
    coalesce(reports_2021.total_hours, 0) as total_hours,
    coalesce(reports_2021.cso_count,0)    as cso_count,
    coalesce(reports_2021.total_spills - reports_2020.total_spills, 0) as spills_increase,
    coalesce(reports_2021.total_hours - reports_2020.total_hours, 0)   as hours_increase,
    concat(mps.first_name, ' ', mps.last_name)                         as mp_name,
    mps.party                                                          as mp_party,
    mps.uri                                                            as mp_uri,
    mps_twitter.screen_name                                            as twitter_handle,
    st_asgeojson(st_forcepolygoncw(st_simplifypreservetopology(wkb_geometry, 0.0025))) as geometry
from pcon_dec_2020_uk_bfc con
         left join reports_2021 on reports_2021.constituency = con.pcon20nm
         left join reports_2020 on reports_2021.constituency = reports_2020.constituency
         left join mps on reports_2021.constituency = mps.constituency
         left join mps_twitter on mps.constituency = mps_twitter.constituency
where con.pcon20cd like 'E%' or con.pcon20cd like 'W%'
order by constituency
