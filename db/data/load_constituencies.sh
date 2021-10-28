#!/bin/bash

mydir=$(dirname $0)

mkdir $mydir/tmp

cd $mydir/tmp

unzip $mydir/Westminster_Parliamentary_Constituencies_(December_2020)_UK_BFC.zip

ogr2ogr -nlt PROMOTE_TO_MULTI -f PGDump -t_srs "EPSG:4326" PCON_DEC_2020_UK_BFC.sql PCON_DEC_2020_UK_BFC.shp

psql -h localhost -d gis -U docker -q -f PCON_DEC_2020_UK_BFC.sql
