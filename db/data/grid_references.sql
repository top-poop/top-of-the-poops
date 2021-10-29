drop table if exists grid_references;

create table grid_references (
    grid_reference text primary key,
    lat numeric,
    lon numeric
)