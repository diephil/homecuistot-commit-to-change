CREATE TABLE "user_pantry_staples" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"ingredient_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "ingredient_aliases" CASCADE;--> statement-breakpoint
ALTER TABLE "user_pantry_staples" ADD CONSTRAINT "user_pantry_staples_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_user_pantry_staples_unique" ON "user_pantry_staples" USING btree ("user_id","ingredient_id");--> statement-breakpoint
CREATE INDEX "idx_user_pantry_staples_user" ON "user_pantry_staples" USING btree ("user_id");