
.PHONY: prod
prod:
	NODE_ENV=production npm run build-index-prod
	NODE_ENV=production npm run build-maps-prod
	NODE_ENV=production npm run build-bathing-prod

.PHONY: dev
dev:
	npm run build-index-dev
	npm run build-maps-dev
	npm run build-bathing-dev

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
