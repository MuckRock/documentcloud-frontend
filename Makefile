install:
	docker volume create nodemodules && docker-compose -f local.builder.yml run --rm install

build:
	docker-compose -f local.builder.yml run --rm build

dev:
	docker-compose -f local.yml up documentcloud_frontend

buildserve:
	docker-compose -f local.yml up documentcloud_frontend_build

test:
	docker-compose -f local.yml up documentcloud_frontend_test
