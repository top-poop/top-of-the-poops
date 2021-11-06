select company_name, bathing, sum(total_spill_hours) as total_hours from edm where bathing is not null
group by company_name, bathing
having sum(total_spill_hours) > 0
order by 3 desc
