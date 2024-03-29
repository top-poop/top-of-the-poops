
DROP table if exists beach_mapping_temp CASCADE;

create table beach_mapping_temp (
    edm_name text,
    beach_name text,
    unused text
);


\copy beach_mapping_temp from 'provided/edm-bathing-to-beach-mapping.csv' delimiter ',' csv header;


insert into edm_bathing_to_beach_mapping
select distinct edm_name, beach_name
from beach_mapping_temp
where edm_name not in ( select bathing from bathing_classification)
on conflict do nothing;

insert into edm_bathing_to_beach_mapping
select bathing, bathing from bathing_classification;

drop table beach_mapping_temp;
