
DROP TABLE IF EXISTS events_thames CASCADE;

create table events_thames (
   location_name text,
   permit_number text,
   location_grid_reference text,
   x text,
   y text,
   alert_type text,
   date_time timestamp
);

