
drop table if exists stream_lookup;

create table stream_lookup(
    stream_id text,
    stream_id_old text,
    site_name_consent text,
    site_name_wasc text,
    wfd_waterbody_id text,
    receiving_water text
);

create unique index stream_lookup_idx1 on stream_lookup(stream_id);
create unique index stream_lookup_idx2 on stream_lookup(stream_id_old);

