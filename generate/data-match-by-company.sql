select reporting_year, edm.company_name, 'unmatched' as type, count(*) as count from edm
left join consents c on edm.consent_id = c.permit_number
where c.permit_number is null
group by reporting_year, edm.company_name
union all
select reporting_year, company_name, 'matched' as type, count(*) as count
from edm_consent_view
group by reporting_year, company_name
order by reporting_year, company_name, type;