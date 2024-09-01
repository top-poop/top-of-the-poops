
drop view if exists rainfall_daily cascade ;

create or replace view rainfall_daily as
    select station_id, date_time::date as date, sum(case when reading_mm > 120 then null else reading_mm end) as rainfall_mm from rainfall_readings
    group by station_id, date_time::date
    order by station_id, date_time::date;

-- Any station in a constituency or approx 3-5km from it is considered to contribute. (its an ellipse 3km wide, 5km high)
-- would make it a circle, but don't quite understand the geometry conversion
drop materialized view if exists rainfall_station_constituency;
create materialized view rainfall_station_constituency as
    select rs.station_id, nearby.distance, nearby.pcon24nm
    from rainfall_stations rs
         cross join lateral (select point <-> con.wkb_geometry as distance, con.pcon24nm from pcon_july_2024_uk_bfc con order by distance) as nearby
    where
        distance < 0.05;

refresh materialized view rainfall_station_constituency;

create or replace view rainfall_constituency as
    select pcon24nm, rs.station_id, date, rainfall_mm from rainfall_daily
        join rainfall_stations rs on rainfall_daily.station_id = rs.station_id
        join rainfall_station_constituency rsc on rs.station_id =rsc.station_id;

drop materialized view if exists rainfall_daily_consitituency;
create materialized view rainfall_daily_consitituency as
    select pcon24nm, date, min(rainfall_mm), avg(rainfall_mm), max(rainfall_mm), percentile_disc(0.75) within group ( order by rainfall_mm ) as pct_75, count(*)
    from rainfall_constituency
    group by pcon24nm, date;

refresh materialized view rainfall_daily_consitituency;