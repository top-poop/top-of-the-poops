\copy edm from 'download/edm-consolidated.csv' delimiter ',' csv header;
\copy edm from 'download/edm-2021/edm-consolidated.csv' delimiter ',' csv header;
\copy edm from 'download/edm-wales-2021/edm-consolidated.csv' delimiter ',' csv header;

delete from edm where company_name is null;
