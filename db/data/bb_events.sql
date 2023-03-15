
drop table if exists bb_events;

create table bb_events (
    id numeric,
    event_id numeric,
    site_unit_number numeric,
    bathing_site text,
    event_start timestamp,
    event_stop timestamp,
    duration numeric,
    activity text,
    associated_site_id numeric,
    outfall_name text,
    genuine bool,
    impacting bool
);

drop table if exists bb_site_mapping;

create table bb_site_mapping (
    bb_associated_site_id numeric,
    consent_id text,
    confidence text,
    bb_outfall_name text
);

