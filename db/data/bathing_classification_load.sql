DROP table if exists bathing_classification_temp CASCADE;

create table bathing_classification_temp
(
    bathing                    varchar,
    lat                        numeric,
    lon                        numeric,
    water_company              text,
    classification             varchar
);

\copy bathing_classification_temp from 'bathing-classification.csv' delimiter ',' csv header;

insert into bathing_classification
select
       bathing,
       water_company,
       classification,
       lat,
       lon
from bathing_classification_temp
on conflict do nothing;

drop table bathing_classification_temp;
