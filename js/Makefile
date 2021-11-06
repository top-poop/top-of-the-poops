
.PHONY: prod
prod:
	npm run build-prod

.PHONY: watch
watch:
	@npm run build; \
	while true; \
	do \
		inotifywait -q -r -e modify,create,delete .; \
		npm run build; \
	done

