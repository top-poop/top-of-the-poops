drop table if exists grid_references cascade;

create table grid_references (
    grid_reference text primary key,
    lat numeric,
    lon numeric,
    point GEOMETRY(point, 4326),
    pcon24nm text
);

create index grid_ref_point_idx on grid_references using gist(point);

ALTER TABLE grid_references
    ADD COLUMN IF NOT EXISTS point_geog geography(Point, 4326) GENERATED ALWAYS AS (point::geography) STORED;

CREATE INDEX IF NOT EXISTS idx_points_geog ON grid_references USING GIST (point_geog);
