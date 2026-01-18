.PHONY: dev dev-all down opstart opdown sbstart sbstop

dev:
	cd apps/nextjs && pnpm dev

dev-all:
	make opstart
	make sbstart
	make dev

down:
	make opdown && make sbstop

opstart:
	./infra/opik/opik.sh

opdown:
	./infra/opik/opik.sh --stop

sbstart:
	cd apps/nextjs && pnpx supabase start

sbstop:
	cd apps/nextjs && pnpx supabase stop
