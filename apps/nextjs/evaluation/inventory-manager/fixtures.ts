/**
 * Fixture Builder: Reusable helper for building test inventory states
 */

import type { CurrentInventoryItem } from "./types";

export class InventoryFixture {
  private items: CurrentInventoryItem[] = [];

  /**
   * Add an ingredient to the inventory
   */
  add(params: {
    id: string;
    ingredientId: string;
    name: string;
    quantityLevel: 0 | 1 | 2 | 3;
    isPantryStaple?: boolean;
  }): this {
    this.items.push({
      id: params.id,
      ingredientId: params.ingredientId,
      name: params.name.toLowerCase(),
      quantityLevel: params.quantityLevel,
      isPantryStaple: params.isPantryStaple ?? false,
      category: "test", // TODO: put real categories later
    });
    return this;
  }

  /**
   * Build and return the inventory array
   */
  build(): CurrentInventoryItem[] {
    return this.items;
  }
}
