

DOWNLOAD=download

CONSTITUENCIES_NAME=Westminster_Parliamentary_Constituencies_December_2020_UK_BFC.zip

ROOT_DIR:=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))

#Don't care about this.. its just a local database
export PGPASSWORD=docker
PSQL=psql -h localhost -d gis -U docker -q --pset=pager=off
CURL=curl --fail --silent
PYTHON=../../venv/bin/python3

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

$(DOWNLOAD)/PCON_DEC_2020_UK_BFC.sql: $(DOWNLOAD)/PCON_DEC_2020_UK_BFC.shp
	ogr2ogr -nlt PROMOTE_TO_MULTI -f PGDump -t_srs "EPSG:4326" $@ $<
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

$(DOWNLOAD)/consents_active.csv: $(DOWNLOAD)/consented.accdb
	$(PYTHON) mdb-extract-all.py --output $(DOWNLOAD) $<

$(DOWNLOAD)/consents-processed.csv: $(DOWNLOAD)/consents_active.csv process_consents.py
	$(PYTHON) process_consents.py $< $@

load-consents: consents.sql load_consents.sql $(DOWNLOAD)/consents-processed.csv
	$(PSQL) -f $<
	$(PSQL) -f $(word 2,$^)

EDM_ZIP=Event_Duration_Monitoring_-_Storm_Overflows_-2020.zip

$(DOWNLOAD)/$(EDM_ZIP):
	$(CURL) -o $@ 'https://environment.data.gov.uk/portalstg/sharing/rest/content/items/045af51b3be545b79b0c219811d3d243/data'

$(DOWNLOAD)/standardised-returns.csv: $(DOWNLOAD)/$(EDM_ZIP) process_edms.py
	unzip -o -d $(DOWNLOAD) $<
	./convert-edm-xlsx.sh $(DOWNLOAD)
	$(PYTHON) process_edms.py $(DOWNLOAD)

.PHONY: load-edm
load-edm: edm.sql load_edm.sql $(DOWNLOAD)/standardised-returns.csv
	$(PSQL) -f $<
	$(PSQL) -f $(word 2,$^)

## Grid References

$(DOWNLOAD)/grid-references.csv: $(DOWNLOAD)/consents_active.csv convert-grid-references.py
	$(PYTHON) convert-grid-references.py $< $@

.PHONY: load-grid-references
load-grid-references: grid_references.sql load_grid_references.sql $(DOWNLOAD)/grid-references.csv
	$(PSQL) -f $<
	$(PSQL) -f $(word 2,$^)

##

load-edm-consent-view: edm_consent_view.sql load-edm load-consents
	$(PSQL) -f $<

## Postcodes

POSTCODE_CSV=postcode-centroids.csv

$(DOWNLOAD)/$(POSTCODE_CSV):
	echo "Downloading postcode centroids - 1.2GB - takes a while"
	$(CURL) --location -o $@ 'http://geoportal1-ons.opendata.arcgis.com/datasets/75edec484c5d49bcadd4893c0ebca0ff_0.csv?outSR={%22latestWkid%22:27700,%22wkid%22:27700}'

.PHONY: load-postcodes
load-postcodes: centroids.sql load_centroids.sql $(DOWNLOAD)/$(POSTCODE_CSV)
	$(PSQL) -f $<
	$(PSQL) -f $(word 2,$^)

.PHONY: load-sewage
load-sewage: load-consents load-edm load-edm-consent-view

.PHONY: load-all
load-all: load-constituencies load-mps load-sewage load-grid-references

clean:
	rm -rf $(DOWNLOAD)