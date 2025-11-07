
ALTER TABLE os_open_built_up_areas
    ADD COLUMN IF NOT EXISTS geography geography(MultiPolygon, 4326)
        GENERATED ALWAYS AS (geometry::geography) STORED;


create index if not exists os_open_built_up_areas_idx1 on os_open_built_up_areas using gist(geography);
create unique index if not exists os_open_built_up_areas_idx2 on os_open_built_up_areas (gsscode);
create unique index if not exists os_open_built_up_areas_idx3 on os_open_built_up_areas (name1_text);
