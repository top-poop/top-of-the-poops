
PROVIDED=provided
DOWNLOAD=download
DATA=$(DOWNLOAD)/data

#Don't care about this.. its just a local database
export PGPASSWORD=docker
PSQL=psql -v ON_ERROR_STOP=1 -h localhost -d gis -U docker -q --pset=pager=off
CURL=curl --fail --silent
PYTHON=../../venv/bin/python3
XLSX2CSV=../../venv/bin/xlsx2csv -e -i
OGR2OGR=ogr2ogr -nlt PROMOTE_TO_MULTI -f PGDump -t_srs "EPSG:4326"
UNZIP=unzip -o -d $(DOWNLOAD)


%.sql: %.shp
	$(OGR2OGR) $@ $<
	sed -i -e 's/NUMERIC(24,15)/NUMERIC/' $@
	sed -i -e 's/NUMERIC(19,11)/NUMERIC/' $@


$(DATA)/Areas_of_Outstanding_Natural_Beauty_England.shp: provided/NE_AreasOfOutstandingNaturalBeautyEngland_SHP_Full.zip
	$(UNZIP) $<
	touch $@

.PHONY: load-aonb-england
load-aonb-england: $(DATA)/Areas_of_Outstanding_Natural_Beauty_England.sql
	$(PSQL) -f $<


$(DATA)/Sites_of_Special_Scientific_Interest_England.shp: provided/NE_SitesOfSpecialScientificInterestEngland_SHP_Full.zip
	$(UNZIP) $<
	touch $@

.PHONY: load-sssi-england
load-sssi-england: $(DATA)/Sites_of_Special_Scientific_Interest_England.sql
	$(PSQL) -f $<


$(DATA)/GWC21_Site_of_Special_Scientific_InterestPolygon.shp: provided/GWC21_Site_of_Special_Scientific_Interest.zip
	$(UNZIP)/data $<
	touch $@

.PHONY: load-sssi-wales
load-sssi-wales: $(DATA)/GWC21_Site_of_Special_Scientific_InterestPolygon.sql
	$(PSQL) -f $<


$(DATA)/Water_Environment_WFD_Shellfish_Water_Protected_Areas_England.shp: provided/EA_WaterEnvironmentWFDShellfishWaterProtectedAreasEngland_SHP_Full.zip
	$(UNZIP) $<
	touch $@

.PHONY: load-shellfish-england
load-shellfish-england: $(DATA)/Water_Environment_WFD_Shellfish_Water_Protected_Areas_England.sql
	$(PSQL) -f $<

$(DATA)/shellfish_waters_protected_area.shp: provided/shellfish_waters_protected_area.zip
	$(UNZIP)/data $<

.PHONY: load-shellfish-wales
load-shellfish-wales: $(DATA)/shellfish_waters_protected_area.sql
	$(PSQL) -f $<


load-shellfish-devolved: load-shellfish-england load-shellfish-wales

load-shellfish:	load-shellfish-devolved shellfish-views.sql
	$(PSQL) -f $(word 2,$^)

