\copy edm from 'download/edm-consolidated.csv' delimiter ',' csv header;
\copy edm from 'download/edm-2021/edm-consolidated.csv' delimiter ',' csv header;
\copy edm from 'download/edm-2022/edm-consolidated.csv' delimiter ',' csv header;
\copy edm from 'download/edm-wales-2021/edm-consolidated.csv' delimiter ',' csv header;
\copy edm from 'download/edm-wales-2022/edm-consolidated.csv' delimiter ',' csv header;

delete
from edm
where company_name is null;



create temporary table bathing_updates as (select old.consent_id as old_consent,
                                                  new.consent_id as new_consent,
                                                  old.site_name  as old_site,
                                                  new.site_name  as new_site,
                                                  old.bathing    as old_bathing,
                                                  new.bathing    as bathing
                                           from edm as new
                                                    join edm as old on new.consent_id = old.consent_id
                                               and old.company_name = new.company_name
                                           where new.company_name ilike 'dwr%'
                                             and new.reporting_year = 2022
                                             and old.reporting_year = 2021
                                             and old.bathing is not null);

update edm
set bathing = tmp.old_bathing
from bathing_updates as tmp
where tmp.new_consent = edm.consent_id
  and edm.company_name ilike 'dwr%'
  and edm.reporting_year = 2022;

drop table bathing_updates;




