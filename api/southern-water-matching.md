Matching southern water locations to consents

- It is best efforts!

### Create a table with all the consent address information

```sql
create table consents_names as (
select consents_unique_view.permit_number, discharge_site_name, discharge_site_name || ' ' || coalesce(add_of_discharge_site_line_1,'') || ' ' || coalesce(add_of_discharge_site_line_2,'') || ' ' || coalesce(add_of_discharge_site_line_3,'') || ' ' || coalesce(add_of_discharge_site_line_4,'') as names
from consents_unique_view
where company_name ilike 'SOUTHERN WATER%' and revocation_date is null
);
create index trgm_idx on consents_names using gist (names gist_trgm_ops);
```

### Create a table with the ids and names from the consolidated events

```sql
create table bb_temp ( id numeric, site text);
```

```shell
cat interpreted.csv | cut -d, -f 9,10| sort | uniq | grep -v assoc > ~/dev/gis/db/data/provided/bb-sites.csv
```

```sql
\copy bb_temp from provided/bb-sites.csv delimiter ',';
```

### Try and match the two up..

```sql
set pg_trgm.similarity_threshold = 0.4;
select * from (
select id, permit_number,
site, names, similarity(site, names) as sim,
row_number() over (partition by id order by similarity(site, names) desc) as rn
from bb_temp join consents_names on site % names) x
where rn = 1
order by site, sim desc;
```

Eyeball it.... reject the ones that look wrong, but mostly ok.