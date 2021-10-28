set datestyle to SQL,DMY;
\copy collisions from 'db/data/dft-road-casualty-statistics-accident-1979-2020.csv' delimiter ',' csv header null 'NULL';
