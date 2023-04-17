
DOWNLOAD=download

CONSTITUENCIES_NAME=Westminster_Parliamentary_Constituencies_December_2020_UK_BFC.zip

ROOT_DIR:=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))

#Don't care about this.. its just a local database
export PGPASSWORD=docker
PSQL=psql -v ON_ERROR_STOP=1 -h localhost -d gis -U docker -q --pset=pager=off
CURL=curl --fail --silent
PYTHON=../../venv/bin/python3
XLSX2CSV=../../venv/bin/xlsx2csv -e -i
OGR2OGR=ogr2ogr -nlt PROMOTE_TO_MULTI -f PGDump -t_srs "EPSG:4326"

## MPs Twitter

$(DOWNLOAD)/mps-on-twitter.csv:
	$(CURL) -o $@ 'https://www.politics-social.com/api/list/csv/name'

.PHONY: load-mps-twitter
load-mps-twitter: mps_twitter.sql load_mps_twitter.sql $(DOWNLOAD)/mps-on-twitter.csv
	$(PSQL) -f $<
	$(PSQL) -f $(word 2,$^)

## MPs

$(DOWNLOAD)/mps.csv:
	$(CURL) -o $@ 'https://www.theyworkforyou.com/mps/?f=csv'

.PHONY: load-mps
load-mps: mps.sql load_mps.sql $(DOWNLOAD)/mps.csv
	$(PSQL) -f $<
	$(PSQL) -f $(word 2,$^)


## Constituencies

$(DOWNLOAD)/$(CONSTITUENCIES_NAME):
	@mkdir -p $(DOWNLOAD)
	$(CURL) -o $@ 'https://opendata.arcgis.com/api/v3/datasets/19841da5f8f6403e9fdcfb35c16e11e9_0/downloads/data?format=shp&spatialRefId=27700'

$(DOWNLOAD)/PCON_DEC_2020_UK_BFC.shp: $(DOWNLOAD)/$(CONSTITUENCIES_NAME)
	unzip -o -d $(DOWNLOAD) $<
	touch $@

%.sql: %.shp
	$(OGR2OGR) $@ $<
	sed -i -e 's/NUMERIC(24,15)/NUMERIC/' $@

.PHONY: load-constituencies
load-constituencies: $(DOWNLOAD)/PCON_DEC_2020_UK_BFC.sql
	$(PSQL) -f $<


## Sewage Data

CONSENTED_ZIP=Consented_Discharges_to_Controlled_Waters_with_Conditions.zip
CONSENTED_ACCDB="Consented Discharges to Controlled Waters with Conditions.accdb"

$(DOWNLOAD)/$(CONSENTED_ZIP):
	$(CURL) -o $@ 'https://environment.data.gov.uk/portalstg/sharing/rest/content/items/5e618f2b5c7f47cca44eb468aa2e43f0/data'

$(DOWNLOAD)/consented.accdb: $(DOWNLOAD)/$(CONSENTED_ZIP)
	unzip -o -d $(DOWNLOAD) $<
	mv download/$(CONSENTED_ACCDB) $@
	touch "$@"

$(DOWNLOAD)/consents_all.csv: $(DOWNLOAD)/consented.accdb
	$(PYTHON) mdb-extract-all.py --output $(DOWNLOAD) $<

$(DOWNLOAD)/consents-processed.csv: $(DOWNLOAD)/consents_all.csv process_consents.py
	$(PYTHON) process_consents.py $< $@

$(DOWNLOAD)/consents-consolidated.csv: $(DOWNLOAD)/consents-processed.csv $(DOWNLOAD)/consents-wales-standardised.csv
	cat $^ > $@

load-consents: consents.sql load_consents.sql $(DOWNLOAD)/consents-consolidated.csv
	$(PSQL) -f $<
	$(PSQL) -f $(word 2,$^)

EDM_ZIP=Event_Duration_Monitoring_-_Storm_Overflows_-2020.zip

$(DOWNLOAD)/$(EDM_ZIP):
	$(CURL) -o $@ 'https://environment.data.gov.uk/portalstg/sharing/rest/content/items/045af51b3be545b79b0c219811d3d243/data'

$(DOWNLOAD)/edm.csv: $(DOWNLOAD)/$(EDM_ZIP) process_edms.py
	unzip -o -d $(DOWNLOAD) $<
	./convert-edm-xlsx.sh $(DOWNLOAD)
	$(PYTHON) process_edms.py $(DOWNLOAD) $@

COMBINE=awk 'FNR==1 && NR!=1{next;}{print}'

$(DOWNLOAD)/edm-consolidated.csv: $(DOWNLOAD)/edm.csv $(DOWNLOAD)/edm-wales-standardised.csv
	$(COMBINE) $^ > $@


# EDM 2021

EDM_ZIP_2021=EDM_2021_Storm_Overflow_Annual_Return.zip

$(DOWNLOAD)/$(EDM_ZIP_2021):
	$(CURL) -o $@ 'https://environment.data.gov.uk/portalstg/sharing/rest/content/items/7581f0165e864d7e93c5535d04906932/data'


# jump through hoops to make a filename with no spaces
$(DOWNLOAD)/edm-2021/all.xslx: $(DOWNLOAD)/$(EDM_ZIP_2021)
	mkdir -p $(dir $@)
	unzip -o -d $(DOWNLOAD)/edm-2021 $<
	cp "$(dir $@)/EDM_2021_Storm_Overflow_Annual_Return/EDM 2021 Storm Overflow Annual Return - all water and sewerage companies.xlsx" $@


EDM_2021_NAMES=anglian dcww northumbrian severn-trent south-west southern thames united wessex yorkshire
EDM_2021_RETURNS=$(foreach name,$(EDM_2021_NAMES),$(DOWNLOAD)/edm-2021/company/$(name).csv)

$(DOWNLOAD)/edm-2021/company/anglian.csv: $(DOWNLOAD)/edm-2021/all.xslx
	mkdir -p $(dir $@)
	$(XLSX2CSV) -s 1 $< $@ 2> /dev/null

$(DOWNLOAD)/edm-2021/company/dcww.csv: $(DOWNLOAD)/edm-2021/all.xslx
	mkdir -p $(dir $@)
	$(XLSX2CSV) -s 2 $< $@ 2> /dev/null

$(DOWNLOAD)/edm-2021/company/northumbrian.csv: $(DOWNLOAD)/edm-2021/all.xslx
	mkdir -p $(dir $@)
	$(XLSX2CSV) -s 3 $< $@ 2> /dev/null

$(DOWNLOAD)/edm-2021/company/severn-trent.csv: $(DOWNLOAD)/edm-2021/all.xslx
	mkdir -p $(dir $@)
	$(XLSX2CSV) -s 4 $< $@ 2> /dev/null

$(DOWNLOAD)/edm-2021/company/south-west.csv: $(DOWNLOAD)/edm-2021/all.xslx
	mkdir -p $(dir $@)
	$(XLSX2CSV) -s 5 $< $@ 2> /dev/null

$(DOWNLOAD)/edm-2021/company/southern.csv: $(DOWNLOAD)/edm-2021/all.xslx
	mkdir -p $(dir $@)
	$(XLSX2CSV) -s 6 $< $@ 2> /dev/null

$(DOWNLOAD)/edm-2021/company/thames.csv: $(DOWNLOAD)/edm-2021/all.xslx
	mkdir -p $(dir $@)
	$(XLSX2CSV) -s 7 $< $@ 2> /dev/null

$(DOWNLOAD)/edm-2021/company/united.csv: $(DOWNLOAD)/edm-2021/all.xslx
	mkdir -p $(dir $@)
	$(XLSX2CSV) -s 8 $< $@ 2> /dev/null

$(DOWNLOAD)/edm-2021/company/wessex.csv: $(DOWNLOAD)/edm-2021/all.xslx
	mkdir -p $(dir $@)
	$(XLSX2CSV) -s 9 $< $@ 2> /dev/null

$(DOWNLOAD)/edm-2021/company/yorkshire.csv: $(DOWNLOAD)/edm-2021/all.xslx
	mkdir -p $(dir $@)
	$(XLSX2CSV) -s 10 $< $@ 2> /dev/null

$(DOWNLOAD)/edm-2021/edm-consolidated.csv: process_edms_2021.py $(EDM_2021_RETURNS)
		$(PYTHON) process_edms_2021.py $@ $^

########## EDM 2022 ####################

# EDM 2022

EDM_ZIP_2022=EDM_2022_Storm_Overflow_Annual_Return.zip

$(DOWNLOAD)/$(EDM_ZIP_2022):
	$(CURL) -o $@ 'https://environment.data.gov.uk/portalstg/sharing/rest/content/items/2f8d9b7628dd4f60a30fb1a8483fc2ae/data'


# jump through hoops to make a filename with no spaces
$(DOWNLOAD)/edm-2022/all.xslx: $(DOWNLOAD)/$(EDM_ZIP_2022)
	mkdir -p $(dir $@)
	unzip -o -d $(DOWNLOAD)/edm-2022 $<
	cp "$(dir $@)/EDM_2022_Storm_Overflow_Annual_Return/EDM 2022 Storm Overflow Annual Return - all water and sewerage companies.xlsx" $@


EDM_2022_NAMES=anglian dcww northumbrian severn-trent south-west southern thames united wessex yorkshire
EDM_2022_RETURNS=$(foreach name,$(EDM_2022_NAMES),$(DOWNLOAD)/edm-2022/company/$(name).csv)

$(DOWNLOAD)/edm-2022/company/anglian.csv: $(DOWNLOAD)/edm-2022/all.xslx
	mkdir -p $(dir $@)
	$(XLSX2CSV) -s 1 $< $@ 2> /dev/null

$(DOWNLOAD)/edm-2022/company/dcww.csv: $(DOWNLOAD)/edm-2022/all.xslx
	mkdir -p $(dir $@)
	$(XLSX2CSV) -s 2 $< $@ 2> /dev/null

$(DOWNLOAD)/edm-2022/company/northumbrian.csv: $(DOWNLOAD)/edm-2022/all.xslx
	mkdir -p $(dir $@)
	$(XLSX2CSV) -s 3 $< $@ 2> /dev/null

$(DOWNLOAD)/edm-2022/company/severn-trent.csv: $(DOWNLOAD)/edm-2022/all.xslx
	mkdir -p $(dir $@)
	$(XLSX2CSV) -s 4 $< $@ 2> /dev/null

$(DOWNLOAD)/edm-2022/company/south-west.csv: $(DOWNLOAD)/edm-2022/all.xslx
	mkdir -p $(dir $@)
	$(XLSX2CSV) -s 5 $< $@ 2> /dev/null

$(DOWNLOAD)/edm-2022/company/southern.csv: $(DOWNLOAD)/edm-2022/all.xslx
	mkdir -p $(dir $@)
	$(XLSX2CSV) -s 6 $< $@ 2> /dev/null

$(DOWNLOAD)/edm-2022/company/thames.csv: $(DOWNLOAD)/edm-2022/all.xslx
	mkdir -p $(dir $@)
	$(XLSX2CSV) -s 7 $< $@ 2> /dev/null

$(DOWNLOAD)/edm-2022/company/united.csv: $(DOWNLOAD)/edm-2022/all.xslx
	mkdir -p $(dir $@)
	$(XLSX2CSV) -s 8 $< $@ 2> /dev/null

$(DOWNLOAD)/edm-2022/company/wessex.csv: $(DOWNLOAD)/edm-2022/all.xslx
	mkdir -p $(dir $@)
	$(XLSX2CSV) -s 9 $< $@ 2> /dev/null

$(DOWNLOAD)/edm-2022/company/yorkshire.csv: $(DOWNLOAD)/edm-2022/all.xslx
	mkdir -p $(dir $@)
	$(XLSX2CSV) -s 10 $< $@ 2> /dev/null

$(DOWNLOAD)/edm-2022/edm-consolidated.csv: process_edms_2022.py $(EDM_2022_RETURNS)
		$(PYTHON) process_edms_2022.py $@ $^

######################

.PHONY: load-edm
load-edm: edm.sql load_edm.sql $(DOWNLOAD)/edm-consolidated.csv $(DOWNLOAD)/edm-2021/edm-consolidated.csv $(DOWNLOAD)/edm-2022/edm-consolidated.csv $(DOWNLOAD)/edm-wales-2021/edm-consolidated.csv $(DOWNLOAD)/edm-wales-2022/edm-consolidated.csv
	$(PSQL) -f $<
	$(PSQL) -f $(word 2,$^)

## Welsh Water Consents & EDMs

# link looks dodgy - might be time limited?
$(DOWNLOAD)/consents-wales.zip:
	$(CURL) -o $@ 'https://storage-eu-205.sharefile.com/download.ashx?dt=dt99e5eec3bd194293acd60049575d41ee&cid=9AQXBd2ldhvlRrRbQ8tE-w&zoneid=zpc3159d90-01f7-41a7-a8ab-3704157466&exp=1637152468&zsid=FB&h=F%2BC3TQBtcWx%2BYjb4jglnxmRAZLWwiRKrwDw7xn%2BoShI%3D'

# GNU make hates files with spaces
$(DOWNLOAD)/consents-wales.csv: $(DOWNLOAD)/consents-wales.zip
	unzip -o -d $(DOWNLOAD) $<
	mv "$(DOWNLOAD)/NRW_DS116329  Consented Discharges to Controlled Waters OCT21.xlsx" $(DOWNLOAD)/consents-wales.xlsx
	(cd $(DOWNLOAD) && libreoffice --headless --convert-to csv consents-wales.xlsx)

$(DOWNLOAD)/edm-wales-standardised.csv $(DOWNLOAD)/consents-wales-standardised.csv: $(DOWNLOAD)/consents-wales.csv $(DOWNLOAD)/edm-wales.csv $(DOWNLOAD)/edm.csv process_consents_wales.py bodges.py
	$(PYTHON) process_consents_wales.py \
		--consents $< \
		--wales-edms $(word 2,$^) \
		--edms $(word 3,$^) \
		--to-consents $(DOWNLOAD)/consents-wales-standardised.csv \
		--to-edms $(DOWNLOAD)/edm-wales-standardised.csv

WELSH_EDM_FILE=Welsh-Water-2020-Data-Request-739_EIR-702.xlsx

$(DOWNLOAD)/edm-wales.csv: $(realpath provided/$(WELSH_EDM_FILE))
	( cd $(DOWNLOAD) && libreoffice --headless --convert-to csv $< )
	mv $(DOWNLOAD)/$(addsuffix .csv,$(basename $(WELSH_EDM_FILE))) $@

# Wales EDM 2021
EDM_WALES_2021=$(DOWNLOAD)/edm-wales-2021

$(EDM_WALES_2021)/edm-emergency.xlsx:
	mkdir -p $(dir $@)
	$(CURL) -o $@ 'https://www.dwrcymru.com/-/media/Project/Files/Page-Documents/Our-Services/Wastewater/CSO/EDM-Return-Dwr-Cymru-Welsh-Water-Emergency-Overflow-Annual-2021.ashx'

$(EDM_WALES_2021)/edm-emergency.csv: $(EDM_WALES_2021)/edm-emergency.xlsx
	$(XLSX2CSV) -s 2 $< $@ 2> /dev/null

$(EDM_WALES_2021)/edm-storm.xlsx:
	mkdir -p $(dir $@)
	$(CURL) -o $@ 'https://www.dwrcymru.com/-/media/Project/Files/Page-Documents/Our-Services/Wastewater/CSO/EDM-Return-Dwr-Cymru-Welsh-Water-Storm-Overflow-Annual-2021.ashx'

$(EDM_WALES_2021)/edm-storm.csv: $(EDM_WALES_2021)/edm-storm.xlsx
	$(XLSX2CSV) -s 2 $< $@ 2> /dev/null

$(EDM_WALES_2021)/edm-annual.xlsx:
	mkdir -p $(dir $@)
	$(CURL) -o $@ https://www.dwrcymru.com/-/media/Project/Files/Page-Documents/Our-Services/Wastewater/CSO/EDM-Return-DCWW_Wales-Water-Annual-2021.ashx

$(EDM_WALES_2021)/edm-annual.csv: $(EDM_WALES_2021)/edm-annual.xlsx
	$(XLSX2CSV) -s 2 $< $@ 2> /dev/null


EDM_WALES_2021_FILES=$(EDM_WALES_2021)/edm-emergency.csv $(EDM_WALES_2021)/edm-storm.csv $(EDM_WALES_2021)/edm-annual.csv

$(EDM_WALES_2021)/edm-consolidated.csv: process_edms_2021_wales.py $(EDM_WALES_2021_FILES)
	$(PYTHON) process_edms_2021_wales.py --storm $(EDM_WALES_2021)/edm-storm.csv --emergency $(EDM_WALES_2021)/edm-emergency.csv --annual $(EDM_WALES_2021)/edm-annual.csv $@


########### WALES EDM 2022 ##################

# CURL commands do not work due to SSL config of Dwr Cmyru site... 'unsafe legacy renegotiation disabled'

EDM_WALES_2022=$(DOWNLOAD)/edm-wales-2022

$(EDM_WALES_2022)/edm-emergency.xlsx:
	mkdir -p $(dir $@)
	$(CURL) -o $@ 'https://corporate.dwrcymru.com/-/media/Project/Files/Page-Documents/Corporate/Environment/Combined-Storm-Overflows/Annual-Emergency-Overflow-Annual-EDM-return---DCWW-2022.ashx'

$(EDM_WALES_2022)/edm-emergency.csv: $(EDM_WALES_2022)/edm-emergency.xlsx
	$(XLSX2CSV) -s 2 $< $@ 2> /dev/null

$(EDM_WALES_2022)/edm-emergency-2.xlsx:
	mkdir -p $(dir $@)
	$(CURL) -o $@ 'https://corporate.dwrcymru.com/-/media/Project/Files/Page-Documents/Corporate/Environment/Combined-Storm-Overflows/NRW-Annual-Emergency-Overflow--Unpermitted-Storm-Overflow-EDM-return---DCWW-2022.ashx'

$(EDM_WALES_2022)/edm-emergency-2.csv: $(EDM_WALES_2022)/edm-emergency-and-unpermitted.xlsx
	$(XLSX2CSV) -s 1 $< $@ 2> /dev/null

$(EDM_WALES_2022)/edm-unpermitted.csv: $(EDM_WALES_2022)/edm-emergency-and-unpermitted.xlsx
	$(XLSX2CSV) -s 2 $< $@ 2> /dev/null

$(EDM_WALES_2022)/edm-storm.xlsx:
	mkdir -p $(dir $@)
	$(CURL) -o $@ 'https://corporate.dwrcymru.com/-/media/Project/Files/Page-Documents/Corporate/Environment/Combined-Storm-Overflows/Annual-Storm-Overflow-EDM-return---DCWW-2022.ashx'

$(EDM_WALES_2022)/edm-storm.csv: $(EDM_WALES_2022)/edm-storm.xlsx
	$(XLSX2CSV) -s 1 $< $@ 2> /dev/null

$(EDM_WALES_2022)/edm-annual.xlsx:
	mkdir -p $(dir $@)
	$(CURL) -o $@ 'https://corporate.dwrcymru.com/-/media/Project/Files/Page-Documents/Corporate/Environment/Combined-Storm-Overflows/NRW-Annual-incl-Shellfish-Waters-Storm-Overflow-EDM-return--DCWW-2022.ashx'

$(EDM_WALES_2022)/edm-annual.csv: $(EDM_WALES_2022)/edm-annual.xlsx
	$(XLSX2CSV) -s 1 $< $@ 2> /dev/null

EDM_WALES_2022_FILES=$(EDM_WALES_2022)/edm-emergency.csv $(EDM_WALES_2022)/edm-storm.csv $(EDM_WALES_2022)/edm-annual.csv

$(EDM_WALES_2022)/edm-consolidated.csv: process_edms_2022_wales.py $(EDM_WALES_2022_FILES) $(DOWNLOAD)/edm-2022/edm-consolidated.csv
	$(PYTHON) process_edms_2022_wales.py \
			--storm $(EDM_WALES_2022)/edm-storm.csv \
			--emergency $(EDM_WALES_2022)/edm-emergency.csv \
			--emergency-2 $(EDM_WALES_2022)/edm-emergency-2.csv \
			--annual $(EDM_WALES_2022)/edm-annual.csv \
			--england $(DOWNLOAD)/edm-2022/edm-consolidated.csv $@


#####################


## Grid References

$(DOWNLOAD)/grid-references.csv: $(DOWNLOAD)/consents-consolidated.csv convert-grid-references.py
	$(PYTHON) convert-grid-references.py $< $@


## Rivers England
$(DOWNLOAD)/rivers-england.zip:
	$(CURL) -o $(DOWNLOAD)/rivers-england.zip https://environment.data.gov.uk/UserDownloads/interactive/bee3b5ce379b49e7a07723b317369fac105788/EA_WFDRiverWaterBodiesCycle1_SHP_Full.zip

$(DOWNLOAD)/data/WFD_River_Water_Bodies_Cycle_1.shp: $(DOWNLOAD)/rivers-england.zip
	unzip -o -d $(DOWNLOAD) $<
	touch $@

$(DOWNLOAD)/rivers-england.sql:  $(DOWNLOAD)/data/WFD_River_Water_Bodies_Cycle_1.shp
	$(OGR2OGR) $@ $<
	sed -i -e 's/NUMERIC(24,15)/NUMERIC/' $@

load-rivers-england: $(DOWNLOAD)/rivers-england.sql
	$(PSQL) -f $<

# Rivers Wales
$(DOWNLOAD)/rivers-wales.zip:
	$(CURL) -o $(DOWNLOAD)/rivers-wales.zip 'https://datamap.gov.wales/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typename=inspire-nrw%3ANRW_WFD_RIVERWATERBODIES_C1&outputFormat=SHAPE-ZIP&srs=EPSG%3A27700&format_options=charset%3AUTF-8'

$(DOWNLOAD)/NRW_WFD_RIVERWATERBODIES_C1Line.shp: $(DOWNLOAD)/rivers-wales.zip
	unzip -o -d $(DOWNLOAD) $<
	touch $@

$(DOWNLOAD)/rivers-wales.sql: $(DOWNLOAD)/NRW_WFD_RIVERWATERBODIES_C1Line.shp
	$(OGR2OGR) $@ $<
	sed -i -e 's/NUMERIC(24,15)/NUMERIC/' $@

load-rivers-wales: $(DOWNLOAD)/rivers-wales.sql
	$(PSQL) -f $<


.PHONY: load-river-views
load-river-views: load_river_views.sql
	$(PSQL) -f $<


.PHONY: load-rivers
load-rivers: load-rivers-england load-rivers-wales load-river-views


## Rainfall

.PHONY: rainfall
rainfall:  rainfall.sql
	$(PSQL) -f $<

# must run after load-constituencies and load-edm-consent-view
# but can't be bothered to make the dependencies work right now, just run it after.
.PHONY: load-grid-references
load-grid-references: grid_references.sql load_grid_references.sql update_grid_references.sql $(DOWNLOAD)/grid-references.csv
	$(PSQL) -f $<
	$(PSQL) -f $(word 2,$^)
	$(PSQL) -f $(word 3,$^)

## Thames Water Live Data

.PHONY: events-thames
events-thames:
	$(PSQL) -f events_thames.sql

.PHONY: summary-thames
summary-thames:
	$(PSQL) -f summary_thames.sql

# Southern Water "Beachbouy" data

.PHONY: bb-events
bb-events:  bb_events.sql bb_events_load.sql
	$(PSQL) -f bb_events.sql
	$(PSQL) -f bb_events_load.sql


# Bathing water shapes

$(DOWNLOAD)/bathing/bathing-england.zip:
	@mkdir -p $(dir $@)
	$(CURL) -o $@ https://environment.data.gov.uk/UserDownloads/interactive/86537efb2f184490bdc216e9c4ca27e067728/EA_SensitiveAreasBathingWaters_SHP_Full.zip

$(DOWNLOAD)/bathing/data/Sensitive_Areas_Bathing_Waters.shp: $(DOWNLOAD)/bathing/bathing-england.zip
	unzip -o -d $(DOWNLOAD)/bathing $<
	touch $@

$(DOWNLOAD)/bathing/bathing-wales.zip:
	@mkdir -p $(dir $@)
	$(CURL) -o $@ 'https://datamap.gov.wales/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typename=inspire-nrw%3ANRW_UWWTD_SA_BATHING_WATERS&outputFormat=SHAPE-ZIP&srs=EPSG%3A27700&format_options=charset%3AUTF-8'

$(DOWNLOAD)/bathing/data/NRW_UWWTD_SA_BATHING_WATERSPolygon.shp: $(DOWNLOAD)/bathing/bathing-wales.zip
	@mkdir -p $(dir $@)
	unzip -o -d $(DOWNLOAD)/bathing/data $<
	touch $@

.PHONY:
load-bathing-classification: bathing_classification_create.sql bathing_classification_load.sql
	$(PSQL) -f $<
	$(PSQL) -f $(word 2,$^)


.PHONY: load-beach-mappings
load-beach-mappings: beach_mapping.sql beach_mapping_load.sql load-bathing-classification
	$(PSQL) -f $<
	$(PSQL) -f $(word 2,$^)


.PHONY: load-bathing-areas
load-bathing-areas: $(DOWNLOAD)/bathing/data/Sensitive_Areas_Bathing_Waters.sql $(DOWNLOAD)/bathing/data/NRW_UWWTD_SA_BATHING_WATERSPolygon.sql
	$(PSQL) -f $<
	$(PSQL) -f $(word 2,$^)


load-bathing: load-bathing-areas load-beach-mappings

load-edm-consent-view: edm_consent_view.sql bathing_views.sql load-edm load-consents
	$(PSQL) -f $<
	$(PSQL) -f $(word 2,$^)

.PHONY: load-sewage
load-sewage: load-consents load-edm load-edm-consent-view

.PHONY: load-politics
load-politics: load-constituencies load-mps load-mps-twitter

.PHONY: load-all
load-all: load-politics load-sewage load-grid-references

clean:
	rm -rf $(DOWNLOAD)