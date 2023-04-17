DROP table if exists edm_bathing_to_beach_mapping CASCADE;

create table edm_bathing_to_beach_mapping (
                         edm_name text primary key,
                         beach_name text
);
