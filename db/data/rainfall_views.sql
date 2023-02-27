
drop view if exists rainfall_daily;

create or replace view rainfall_daily as
    select station_id, date_time::date as date, sum(reading_mm) as rainfall_mm from rainfall_readings
    group by station_id, date_time::date
    order by station_id, date_time::date;

create or replace view rainfall_constituency as
    select pcon20nm, rs.station_id, date, rainfall_mm from rainfall_daily
        join rainfall_stations rs on rainfall_daily.station_id = rs.station_id
        join pcon_dec_2020_uk_bfc on st_covers(wkb_geometry, point);

drop view if exists rainfall_daily_consitituency;
create materialized view rainfall_daily_consitituency as
    select pcon20nm, date, min(rainfall_mm), avg(rainfall_mm), max(rainfall_mm), percentile_disc(0.75) within group ( order by rainfall_mm ) as pct_75, count(*)
    from rainfall_constituency
    group by pcon20nm, date
