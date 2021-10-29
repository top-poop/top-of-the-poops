select company_name, shellfishery, sum(total_spill_hours) as total_hours from edm where shellfishery is not null
group by company_name, shellfishery
order by 3 desc
limit 10;
