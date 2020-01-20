install:
	docker volume create nodemodules && docker-compose -f local.builder.yml run --rm install

build:
	docker-compose -f local.builder.yml run --rm build

dev:
	docker-compose -f local.yml up documentcloud_frontend

build-serve:
	docker-compose -f local.yml up documentcloud_frontend_build

build-analyze:
	docker-compose -f local.yml up documentcloud_frontend_analyze

test:
	docker-compose -f local.builder.yml run --rm test
