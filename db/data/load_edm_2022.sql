delete from edm where reporting_year = 2022;

\copy edm from 'download/edm-2022/edm-consolidated.csv' delimiter ',' csv header;
\copy edm from 'download/edm-wales-2022/edm-consolidated.csv' delimiter ',' csv header;
