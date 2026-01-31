ALTER TABLE "recipes" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_pantry_staples" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "recipes" CASCADE;--> statement-breakpoint
DROP TABLE "user_pantry_staples" CASCADE;--> statement-breakpoint
ALTER TABLE "recipe_ingredients" DROP CONSTRAINT "recipe_ingredients_recipe_id_recipes_id_fk";
--> statement-breakpoint
ALTER TABLE "user_recipes" DROP CONSTRAINT "user_recipes_recipe_id_recipes_id_fk";
--> statement-breakpoint
ALTER TABLE "cooking_log" DROP CONSTRAINT "cooking_log_recipe_id_recipes_id_fk";
--> statement-breakpoint
DROP INDEX "idx_user_recipes_unique";--> statement-breakpoint
DROP INDEX "idx_user_recipes_source";--> statement-breakpoint
ALTER TABLE "user_inventory" ADD COLUMN "is_pantry_staple" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user_recipes" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user_recipes" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "user_recipes" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_recipe_id_user_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."user_recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cooking_log" ADD CONSTRAINT "cooking_log_recipe_id_user_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."user_recipes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_user_inventory_pantry" ON "user_inventory" USING btree ("user_id","is_pantry_staple") WHERE "user_inventory"."is_pantry_staple" = true;--> statement-breakpoint
ALTER TABLE "user_recipes" DROP COLUMN "recipe_id";--> statement-breakpoint
ALTER TABLE "user_recipes" DROP COLUMN "source";