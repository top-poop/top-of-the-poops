DROP table if exists edm;

create table edm (
    company_name text,
    site_name text,
    consent_id text,
    activity_reference text,
    shellfishery text,
    bathing text,
    total_spill_hours numeric,
    spill_count numeric,
    reporting_pct numeric,
    excuses text
);

create index edm_consent_idx on edm(consent_id);