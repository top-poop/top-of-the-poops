select edm.company_name, 'unmatched' as type, sum(spill_count) as count from edm
left join consents c on edm.consent_id = c.permit_number
where c.permit_number is null
group by edm.company_name
union all
select edm.company_name, 'matched' as type, sum(spill_count) as count from edm
join consents c on edm.consent_id = c.permit_number
group by edm.company_name
order by 1, 2;