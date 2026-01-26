import { pgTable, uuid, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { ingredients } from "./ingredients";

export const userPantryStaples = pgTable(
  "user_pantry_staples",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    ingredientId: uuid("ingredient_id")
      .notNull()
      .references(() => ingredients.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("idx_user_pantry_staples_unique").on(
      table.userId,
      table.ingredientId,
    ),
    index("idx_user_pantry_staples_user").on(table.userId),
  ],
);

export const userPantryStaplesRelations = relations(
  userPantryStaples,
  ({ one }) => ({
    ingredient: one(ingredients, {
      fields: [userPantryStaples.ingredientId],
      references: [ingredients.id],
    }),
  }),
);
