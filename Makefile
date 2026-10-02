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
	rm -rf build .svelte-kit static/embed static/notes static/viewer
	rm -rf playwright-report test-results coverage storybook-static
