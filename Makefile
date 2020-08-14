install:
	docker volume create nodemodules && docker-compose -f local.builder.yml run --rm install

build:
	docker-compose -f local.builder.yml run --rm build

build-staging:
	docker-compose -f local.builder.yml run --rm build_staging

dev:
	docker-compose -f local.yml up documentcloud_frontend

dev-app:
	docker-compose -f local.yml up documentcloud_frontend_app

dev-enhance:
	docker-compose -f local.yml up documentcloud_frontend_enhance

build-serve:
	docker-compose -f local.yml up documentcloud_frontend_build

build-analyze:
	docker-compose -f local.yml up documentcloud_frontend_analyze

test:
	docker-compose -f local.builder.yml run --rm test

test-watch:
	docker-compose -f local.builder.yml run --rm test-watch
