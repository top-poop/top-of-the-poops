
PYTHON_DIR=venv/bin
PYTHON=$(PYTHON_DIR)/python
PIP=$(PYTHON_DIR)/pip

GENERATE=generate/generic.py

SQLS=$(wildcard generate/*.sql)
GENERATED=$(foreach sql,$(SQLS),web/data/generated/$(basename $(notdir $(sql))).json)

DOWNLOAD=db/data/download
TABLES=$(wildcard db/data/*.sql) $(wildcard db/data/*.py)
FILES=$(DOWNLOAD)/standardised-returns.csv $(DOWNLOAD)/consents-processed.csv $(TABLES)

all: generated

.PHONY: python
python: $(PYTHON)

.python_uptodate: requirements-dev.txt
	python3 -m venv venv
	$(PYTHON) -m pip install --upgrade pip
	$(PIP) install -r $<
	touch $@

$(PYTHON): .python_uptodate

web/data/generated/%.json: generate/$(basename $(notdir %)).sql $(PYTHON) $(GENERATE) $(FILES)
	$(PYTHON) $(GENERATE) $< $@

.PHONY: clean
clean:
	rm web/data/generated/*.json web/data/generated/chloropleth/chloro.json

generated: $(GENERATED) web/data/generated/chloropleth/chloro.json web/data/generated/chloropleth/chloro-counties.json

.PHONY: it
it:
	$(MAKE) generated
	$(MAKE) -C js dev

.PHONY: watch
watch:
	$(MAKE) it
	while true; \
	do \
		inotifywait -q -r -e modify,create,delete .; \
		$(MAKE) it; \
	done


.PHONY: constituencies
constituencies: generate/constituencies/constituencies.py generate/constituencies/constituencies.sql
	rm web/data/generated/constituencies/*.json
	$(PYTHON) $< web/data/generated/constituencies


web/data/generated/chloropleth/chloro.json: generate/constituencies/cloropleth.py  generate/constituencies/chloropleth.sql
	@mkdir -p $(@D)
	$(PYTHON) $< $@

web/data/generated/chloropleth/chloro-counties.json: generate/counties/cloropleth.py  generate/counties/chloropleth-counties.sql
	@mkdir -p $(@D)
	$(PYTHON) $< $@

.PHONY: prod
prod:
	$(MAKE) generated
	$(MAKE) -C js prod

.PHONY: ci
ci:
	$(MAKE) -C js ci