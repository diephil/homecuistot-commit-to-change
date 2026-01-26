ALTER TABLE "ingredients" ALTER COLUMN "category" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "recipe_ingredients" ALTER COLUMN "ingredient_type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_recipes" ALTER COLUMN "source" SET DATA TYPE text;--> statement-breakpoint
CREATE INDEX "idx_user_recipes_source" ON "user_recipes" USING btree ("source");--> statement-breakpoint
DROP TYPE "public"."ingredient_category";--> statement-breakpoint
DROP TYPE "public"."ingredient_type";--> statement-breakpoint
DROP TYPE "public"."recipe_source";