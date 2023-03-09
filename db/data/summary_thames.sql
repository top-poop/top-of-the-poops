

drop table if exists summary_thames;

create table summary_thames (
    permit_id text,
    date date,
    unknown interval,
    online interval,
    overflowing interval,
    potentially_overflowing interval,
    offline interval
);

create unique index summary_thames_ix1 on summary_thames ( permit_id, date);