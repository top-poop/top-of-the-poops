with averages as (
    select
        month,
        avg(reading) as avg,
        avg(reading) + stddev_samp(reading) as plus_1_stddev,
        avg(reading) - stddev_samp(reading) as minus_1_stddev,
        max(reading) as max,
        min(reading) as min
    from rainfall_uk
    where year >= 1990 and year <= 2021
    group by month
)
select
    to_char(to_date(to_char(averages.month, '99'), 'MM'), 'Mon') as month,
    averages.avg,
    averages.plus_1_stddev,
    averages.minus_1_stddev,
    averages.max,
    averages.min,
    current.reading
from averages
         left join rainfall_uk as current on averages.month = current.month and current.year = 2022
order by averages.month;
