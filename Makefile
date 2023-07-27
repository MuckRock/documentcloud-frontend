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

build-browser-test:
	docker compose -f local.builder.yml build browser-test

dev:
	docker compose -f local.yml up documentcloud_frontend

dev-app:
	docker compose -f local.yml up documentcloud_frontend_app

dev-embed:
	docker compose -f local.yml up documentcloud_frontend_embed

down:
	docker compose -f local.yml down

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

browser-test:
	docker compose -f local.builder.yml run --rm browser-test

browser-test-staging:
	docker compose -f local.builder.yml run --rm browser-test-staging

browser-test-direct:
	node tests/functional/suites/noindex.js

browser-test-direct-all:
	BROWSER=firefox node tests/functional/suites/noindex.js
	#BROWSER=chromium node tests/functional/suites/noindex.js
	BROWSER=webkit node tests/functional/suites/noindex.js

# Set BROWSER to change the browser. e.g. BROWSER=chromium make browser-test-headful
browser-test-headful:
	DEBUG=yes node tests/functional/suites/noindex.js

browser-test-headful-staging:
	DEBUG=yes node tests/functional/suites/noindex.js --envfile .env.staging

browser-test-debug:
	DEBUG=yes node debug tests/functional/suites/noindex.js

clean:
	# delete Webpack chunks
	rm -f public/[0-9]*.*.* public/bundle.*.js public/bundle.*.css public/bundle.*.txt
