
.PHONY: prod
prod:
	npm run build-index-prod
	npm run build-maps-prod

.PHONY: dev
dev:
	npm run build-index-dev
	npm run build-maps-dev

.PHONY: watch
watch:
	@npm run build; \
	while true; \
	do \
		inotifywait -q -r -e modify,create,delete .; \
		npm run build; \
	done

.PHONY: ci
ci:
	npm install
	$(MAKE) prod
