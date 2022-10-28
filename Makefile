install:
	docker volume create nodemodules && docker compose -f local.builder.yml run --rm install

install-ci:
	docker volume create nodemodules && docker compose -f local.builder.yml run --rm install-ci


npmlist:
	docker compose -f local.builder.yml run --rm npmlist

build:
	docker compose -f local.builder.yml run --rm build

build-staging:
	docker compose -f local.builder.yml run --rm build_staging

dev:
	docker compose -f local.yml up documentcloud_frontend

dev-app:
	docker compose -f local.yml up documentcloud_frontend_app

dev-embed:
	docker compose -f local.yml up documentcloud_frontend_embed

build-serve:
	docker compose -f local.yml up documentcloud_frontend_build

build-analyze:
	docker compose -f local.yml up documentcloud_frontend_analyze

test:
	docker compose -f local.builder.yml run --rm test

test-watch:
	docker compose -f local.builder.yml run --rm test-watch

prettier-check:
	prettier --check --plugin-search-dir=. src

prettier:
	prettier --write --plugin-search-dir=. src

browser-tests:
	node test/functional/noindex.js

browser-tests-debug:
	DEBUG=yes node test/functional/noindex.js
