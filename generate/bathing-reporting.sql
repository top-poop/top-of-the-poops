select reporting_year, floor((reporting_pct * 100) / 10) * 10 as bin, count(*)
from edm
where bathing is not null
and reporting_year = 2021
and coalesce(excuses, '') not like 'No longer operational%'
group by reporting_year, bin
order by reporting_year, bin;
