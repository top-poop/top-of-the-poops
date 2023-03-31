DROP table if exists edm CASCADE;

create table edm (
                         reporting_year integer,
                         company_name text,
                         site_name text,
                         wasc_site_name text,
                         consent_id text,
                         activity_reference text,
                         shellfishery text,
                         bathing text,
                         total_spill_hours numeric not null,
                         spill_count numeric not null,
                         reporting_pct numeric not null,
                         wfd_waterbody_id text,
                         excuses text,
                         edm_commissioning_info text,
                         reporting_low_reason text,
                         reporting_low_action text,
                         spill_high_reason text,
                         spill_high_action text,
                         spill_high_planning text
);

create index edm_consent_idx on edm(consent_id);