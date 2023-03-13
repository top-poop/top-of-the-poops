
.PHONY: prod
prod:
	npm run build-index-prod
	npm run build-maps-prod
	npm run build-company-prod

.PHONY: dev
dev:
	npm run build-index-dev
	npm run build-company-dev
	npm run build-maps-dev

.PHONY: watch
watch:
	@$(MAKE) dev; \
	while true; \
	do \
		inotifywait -q -r -e modify,create,delete .; \
		$(MAKE) dev; \
	done

.PHONY: ci
ci:
	npm install
	$(MAKE) prod
