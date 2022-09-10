DROP table if exists rainfall_stations CASCADE;
DROP table if exists rainfall_readings CASCADE;

create table rainfall_stations (
    code text primary key,
    name text,
    lat numeric,
    lon numeric
);

create table rainfall_readings (
    code text,
    year numeric,
    month numeric,
    reading numeric,
    constraint rainfall_readings_fk foreign key(code) references rainfall_stations(code)
);

