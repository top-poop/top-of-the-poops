
.PHONY: prod
prod:
	npm run build-prod

.PHONY: dev
dev:
	npm run build

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
