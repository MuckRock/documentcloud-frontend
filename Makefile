install:
	docker volume create nodemodules && docker-compose -f local.builder.yml run --rm install

dev:
	docker-compose -f local.yml up