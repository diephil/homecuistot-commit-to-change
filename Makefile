.PHONY: dev opik down

dev:
	cd apps/nextjs && pnpm dev

opik:
	./infra/opik/opik.sh

down:
	./infra/opik/opik.sh --stop
