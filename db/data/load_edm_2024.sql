
delete from edm where reporting_year = 2024;

\copy edm from 'download/edm-2024/edm-consolidated.csv' delimiter ',' csv header;
\copy edm from 'download/edm-wales-2024/edm-consolidated.csv' delimiter ',' csv header;

delete from edm where company_name is null;
