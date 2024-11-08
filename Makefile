install:
	docker volume create nodemodules && docker compose -f local.builder.yml run --rm install

npmlist:
	docker compose -f local.builder.yml run --rm npmlist

build:
	docker compose -f local.builder.yml run --rm build

build-browser-test:
	docker compose -f local.builder.yml build browser-test

dev:
	docker compose -f local.yml up documentcloud_frontend

preview:
	docker compose -f local.yml up preview

down:
	docker compose -f local.yml down

clean:
	@echo deleting Webpack chunks
	rm -f public/index.html public/[0-9]*.*.* public/bundle.*.js public/bundle.*.css public/bundle.*.txt public/*.map public/*.*.js
	rm -rf public/assets public/notes public/viewer public/embed
	@echo deleting built files
	rm -rf build .svelte-kit .netlify playwright-report
