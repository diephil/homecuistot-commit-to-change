CREATE TYPE "public"."ingredient_category" AS ENUM('meat', 'proteins_nonmeat', 'legumes', 'vegetables', 'starches', 'dairy', 'canned_jarred');--> statement-breakpoint
CREATE TYPE "public"."ingredient_type" AS ENUM('anchor', 'optional', 'assumed');--> statement-breakpoint
CREATE TYPE "public"."recipe_source" AS ENUM('onboarding', 'added', 'other');--> statement-breakpoint
CREATE TABLE "ingredient_aliases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ingredient_id" uuid NOT NULL,
	"alias" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ingredient_aliases_alias_unique" UNIQUE("alias")
);
--> statement-breakpoint
CREATE TABLE "ingredients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" "ingredient_category" NOT NULL,
	"is_assumed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ingredients_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "recipe_ingredients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipe_id" uuid NOT NULL,
	"ingredient_id" uuid NOT NULL,
	"ingredient_type" "ingredient_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_seeded" boolean DEFAULT false NOT NULL,
	"user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recipe_ownership" CHECK (("recipes"."is_seeded" = true AND "recipes"."user_id" IS NULL) OR ("recipes"."is_seeded" = false AND "recipes"."user_id" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "user_inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"ingredient_id" uuid NOT NULL,
	"quantity_level" integer DEFAULT 3 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quantity_level_check" CHECK ("user_inventory"."quantity_level" BETWEEN 0 AND 3)
);
--> statement-breakpoint
CREATE TABLE "user_recipes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"recipe_id" uuid NOT NULL,
	"source" "recipe_source" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cooking_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"recipe_id" uuid,
	"recipe_name" text NOT NULL,
	"cooked_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "unrecognized_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"raw_text" text NOT NULL,
	"context" text,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ingredient_aliases" ADD CONSTRAINT "ingredient_aliases_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_inventory" ADD CONSTRAINT "user_inventory_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_recipes" ADD CONSTRAINT "user_recipes_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cooking_log" ADD CONSTRAINT "cooking_log_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_ingredient_aliases_alias" ON "ingredient_aliases" USING btree ("alias");--> statement-breakpoint
CREATE INDEX "idx_ingredient_aliases_ingredient" ON "ingredient_aliases" USING btree ("ingredient_id");--> statement-breakpoint
CREATE INDEX "idx_ingredients_category" ON "ingredients" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_ingredients_is_assumed" ON "ingredients" USING btree ("is_assumed");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_recipe_ingredients_unique" ON "recipe_ingredients" USING btree ("recipe_id","ingredient_id");--> statement-breakpoint
CREATE INDEX "idx_recipe_ingredients_recipe" ON "recipe_ingredients" USING btree ("recipe_id");--> statement-breakpoint
CREATE INDEX "idx_recipe_ingredients_ingredient" ON "recipe_ingredients" USING btree ("ingredient_id");--> statement-breakpoint
CREATE INDEX "idx_recipe_ingredients_type" ON "recipe_ingredients" USING btree ("ingredient_type");--> statement-breakpoint
CREATE INDEX "idx_recipes_user" ON "recipes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_recipes_user_seeded" ON "recipes" USING btree ("user_id","is_seeded");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_user_inventory_unique" ON "user_inventory" USING btree ("user_id","ingredient_id");--> statement-breakpoint
CREATE INDEX "idx_user_inventory_user" ON "user_inventory" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_inventory_quantity" ON "user_inventory" USING btree ("user_id","quantity_level") WHERE "user_inventory"."quantity_level" > 0;--> statement-breakpoint
CREATE INDEX "idx_user_inventory_matching" ON "user_inventory" USING btree ("user_id","ingredient_id","quantity_level") WHERE "user_inventory"."quantity_level" > 0;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_user_recipes_unique" ON "user_recipes" USING btree ("user_id","recipe_id");--> statement-breakpoint
CREATE INDEX "idx_user_recipes_user" ON "user_recipes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_cooking_log_user" ON "cooking_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_cooking_log_user_date" ON "cooking_log" USING btree ("user_id","cooked_at" DESC);