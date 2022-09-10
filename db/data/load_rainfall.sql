\copy rainfall_stations from 'download/rainfall/stations.csv' delimiter ',' csv header;
\copy rainfall_readings from 'download/rainfall/rainfall.csv' delimiter ',' csv header;
\copy rainfall_uk from 'download/rainfall/uk.csv' delimiter ',' csv header;

alter table rainfall_stations
    add column
        location GEOMETRY(point, 4326);

UPDATE rainfall_stations
SET location = ST_SETSRID(ST_MakePoint(lon, lat), 4326);
