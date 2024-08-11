


delete from consents where company_name = 'Scottish Water';
delete from edm where company_name = 'Scottish Water';

\copy consents from 'provided/scotland-consents.csv' delimiter ',' csv header;
\copy edm from 'provided/scotland-edms.csv' delimiter ',' csv header;

refresh materialized view  consents_unique_view;