
drop table if exists os_open_postcodes cascade;


create table os_open_postcodes
(
    postcode               text primary key,
    pqi                    numeric,
    easting                numeric,
    northing               numeric,
    ons_country_code       text,
    nhs_regional_auth_code text,
    nhs_auth_code          text,
    county_code            text,
    district_code          text,
    ward_code              text,
    point                  geometry(Point)
        GENERATED ALWAYS AS (
            ST_Transform(
                    ST_SetSRID(ST_MakePoint(easting, northing), 27700),
                    4326
            )
            ) STORED
);

\copy os_open_postcodes from 'download/os_open_postcodes_consolidated.csv' delimiter ',' NULL '' csv;

create index os_open_postcodes_idx1 on os_open_postcodes using gist (point);

create materialized view postcode_constituency as
SELECT distinct split_part(l.postcode, ' ', 1) AS outcode,
                c.pcon24nm                     AS constituency
FROM os_open_postcodes l
         JOIN pcon_july_2024_uk_bfc c
              ON ST_Contains(c.wkb_geometry, l.point);

create index postcode_constituency_idx1 on outcode;


