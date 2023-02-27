drop table if exists rainfall_readings;
drop table if exists rainfall_stations;

create table rainfall_stations (
    station_id text primary key,
    lat numeric,
    lon numeric,
    point GEOMETRY(point, 4326)
);

create table rainfall_readings (
    station_id text references rainfall_stations(station_id),
    date_time timestamptz,
    reading_mm numeric
);

