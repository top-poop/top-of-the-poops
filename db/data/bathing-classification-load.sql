DROP table if exists bathing_classification CASCADE;

create table bathing_classification
(
    bathing                    varchar primary key ,
    lat                        numeric,
    lon                        numeric,
    water_company              text,
    classification             varchar
);

\copy bathing_classification from 'bathing-classification.csv' delimiter ',' csv header;

