DROP INDEX "idx_recipe_ingredients_unique";--> statement-breakpoint
DROP INDEX "idx_user_inventory_unique";--> statement-breakpoint
ALTER TABLE "recipe_ingredients" ALTER COLUMN "ingredient_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_inventory" ALTER COLUMN "ingredient_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "recipe_ingredients" ADD COLUMN "unrecognized_item_id" uuid;--> statement-breakpoint
ALTER TABLE "user_inventory" ADD COLUMN "unrecognized_item_id" uuid;--> statement-breakpoint
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_unrecognized_item_id_unrecognized_items_id_fk" FOREIGN KEY ("unrecognized_item_id") REFERENCES "public"."unrecognized_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_inventory" ADD CONSTRAINT "user_inventory_unrecognized_item_id_unrecognized_items_id_fk" FOREIGN KEY ("unrecognized_item_id") REFERENCES "public"."unrecognized_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_recipe_ingredients_ingredient_unique" ON "recipe_ingredients" USING btree ("recipe_id","ingredient_id") WHERE "recipe_ingredients"."ingredient_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_recipe_ingredients_unrecognized_unique" ON "recipe_ingredients" USING btree ("recipe_id","unrecognized_item_id") WHERE "recipe_ingredients"."unrecognized_item_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_recipe_ingredients_unrecognized" ON "recipe_ingredients" USING btree ("unrecognized_item_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_user_inventory_ingredient_unique" ON "user_inventory" USING btree ("user_id","ingredient_id") WHERE "user_inventory"."ingredient_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_user_inventory_unrecognized_unique" ON "user_inventory" USING btree ("user_id","unrecognized_item_id") WHERE "user_inventory"."unrecognized_item_id" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "exactly_one_reference" CHECK (("recipe_ingredients"."ingredient_id" IS NOT NULL) != ("recipe_ingredients"."unrecognized_item_id" IS NOT NULL));--> statement-breakpoint
ALTER TABLE "user_inventory" ADD CONSTRAINT "exactly_one_reference" CHECK (("user_inventory"."ingredient_id" IS NOT NULL) != ("user_inventory"."unrecognized_item_id" IS NOT NULL));