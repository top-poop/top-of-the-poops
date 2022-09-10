with     reports_2020 as (
         select ctyua21nm                               as county,
                coalesce(sum(edm.spill_count), 0)       as total_spills,
                coalesce(sum(edm.total_spill_hours), 0) as total_hours
         from edm_consent_view edm
                  join grid_references on edm.effluent_grid_ref = grid_references.grid_reference
         where reporting_year = 2020
           and grid_references.ctyua21nm is not null
         group by reporting_year, ctyua21nm
     ),
     reports_2021 as (
         select ctyua21nm                                as county,
                coalesce(sum(edm.spill_count), 0)       as total_spills,
                coalesce(sum(edm.total_spill_hours), 0) as total_hours
         from edm_consent_view edm
                  join grid_references on edm.effluent_grid_ref = grid_references.grid_reference
         where reporting_year = 2021
           and grid_references.ctyua21nm is not null
         group by reporting_year, ctyua21nm
     )
select reports_2021.*,
       coalesce(reports_2021.total_spills - reports_2020.total_spills, 0) as spills_increase,
       coalesce(reports_2021.total_hours - reports_2020.total_hours, 0)   as hours_increase,
       st_asgeojson(st_simplifypreservetopology(wkb_geometry, 0.0005)) as geometry
from reports_2021
         left join reports_2020 on reports_2021.county = reports_2020.county
         join ctyua_dec_2021_uk_buc cty on reports_2021.county = cty.ctyua21nm
order by county
