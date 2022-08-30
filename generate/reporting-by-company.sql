select reporting_year, floor((reporting_pct * 100) / 5) * 5 as bin, company_name, count(*)
from edm
group by reporting_year, company_name, bin
order by reporting_year, company_name, bin;
