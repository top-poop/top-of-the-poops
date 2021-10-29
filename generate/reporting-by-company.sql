select floor(reporting_pct/5)*5 as bin, company_name, count(*) from edm
group by 1,2 order by 2,1;
