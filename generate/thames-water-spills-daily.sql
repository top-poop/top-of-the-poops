with overflows as (select date, count(*) as overflowing_count, sum(overflowing) as overflowing_duration
                   from summary_thames
                   where overflowing > INTERVAl '1 hour'
                   group by date),
     thames as (select *
                from edm_consent_view edm
                         join grid_references on edm.effluent_grid_ref = grid_references.grid_reference
                where edm.company_name = 'Thames Water'),
     extent as (select (st_setsrid(st_extent(thames.point), 4326)) as extent from thames),
     stations as (select station_id
                  from rainfall_stations,
                       extent
                  where st_covers(extent.extent, point)),
     rainfall as (select date,
                         min(rainfall_mm)                                            as rainfall_mm_min,
                         avg(rainfall_mm)                                            as rainfall_mm_avg,
                         max(rainfall_mm)                                            as rainfall_mm_max,
                         percentile_disc(0.95) within group ( order by rainfall_mm ) as rainfall_mm_95,
                         count(*)                                                    as station_count
                  from rainfall_daily
                  where station_id in (select station_id from stations)
                  group by date),
     offline as (select date, count(*) as offline_count
                 from summary_thames
                 where offline > INTERVAl '1 hour'
                 group by date)
select overflows.date, overflowing_count, overflowing_duration,
       rainfall_mm_min, rainfall_mm_avg, rainfall_mm_max, rainfall_mm_95, station_count, offline_count
from overflows
    join rainfall on overflows.date = rainfall.date
    join offline on overflows.date = offline.date
where overflows.date >= '2023-01-01'
order by date
