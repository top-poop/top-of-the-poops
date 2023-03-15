select date, permit_id, lat, lon, overflowing, offline
from summary_thames
         join consents_unique_view c on summary_thames.permit_id = c.permit_number
         join grid_references g on c.effluent_grid_ref = g.grid_reference
where overflowing > INTERVAL '1 hour'
   or offline > INTERVAL '1 hour'
order by date, permit_id
