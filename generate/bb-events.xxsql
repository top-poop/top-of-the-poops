select id,
       event_id,
       site_unit_number,
       bathing_site,
       to_char(event_start, 'YYYY-MM-DD"T"HH24:MI:SS') as event_start,
       to_char(event_stop, 'YYYY-MM-DD"T"HH24:MI:SS') as event_stop,
       duration,
       activity,
       genuine,
       impacting,
       company_name,
       discharge_site_name,
       lat,
       lon
from bb_events e
         join bb_site_mapping m on e.associated_site_id = m.bb_associated_site_id
         join consents_unique_view c on c.permit_number = m.consent_id
         join grid_references g on c.effluent_grid_ref = g.grid_reference

