DROP table if exists bathing_classification CASCADE;

create table bathing_classification (
    bathing varchar unique,
    water_company text,
    classification text,
    lat numeric,
    lon numeric
);
