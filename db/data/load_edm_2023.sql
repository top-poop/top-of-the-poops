
delete from edm where reporting_year = 2023;

\copy edm from 'download/edm-2023/edm-consolidated.csv' delimiter ',' csv header;
\copy edm from 'download/edm-wales-2023/edm-consolidated.csv' delimiter ',' csv header;

delete from edm where company_name is null;
