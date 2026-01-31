"use client";

import { useState } from "react";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { updateRecipe, deleteRecipe, validateIngredients } from "@/app/actions/recipes";
import { QuickInputSection } from "@/components/shared/quick-input-section";
import { toast } from "sonner";

interface RecipeEditFormProps {
  recipe: {
    id: string;
    name: string;
    description: string | null;
    recipeIngredients: Array<{
      ingredientId: string | null;
      unrecognizedItemId: string | null;
      ingredient: {
        id: string;
        name: string;
      } | null;
      ingredientType: string;
    }>;
  };
  onClose: () => void;
}

type InputMode = "voice" | "text";

export function RecipeEditForm(props: RecipeEditFormProps) {
  const { recipe, onClose } = props;

  // Filter to only known ingredients (not unrecognized items)
  const knownIngredients = recipe.recipeIngredients.filter(
    (ri): ri is typeof ri & { ingredient: NonNullable<typeof ri.ingredient> } =>
      ri.ingredient !== null
  );

  // Store original state for revert capability
  const [originalState] = useState({
    title: recipe.name,
    description: recipe.description || "",
    ingredients: knownIngredients.map((ri) => ({
      id: ri.ingredient.id,
      name: ri.ingredient.name,
      isOptional: ri.ingredientType === "optional",
    })),
  });

  // Working state (accumulates changes)
  const [title, setTitle] = useState(recipe.name);
  const [description, setDescription] = useState(recipe.description || "");
  const [ingredients, setIngredients] = useState(
    knownIngredients.map((ri) => ({
      id: ri.ingredient.id,
      name: ri.ingredient.name,
      isOptional: ri.ingredientType === "optional",
    }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("voice");

  async function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async function handleVoiceComplete(audioBlob: Blob) {
    try {
      setIsExtracting(true);
      const audioBase64 = await blobToBase64(audioBlob);

      const currentRecipe = {
        title,
        description,
        ingredients: ingredients.map((i) => ({ name: i.name, isOptional: i.isOptional })),
      };

      const response = await fetch("/api/recipes/update-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentRecipe, audioBase64 }),
      });

      if (!response.ok) {
        throw new Error("Failed to process voice update");
      }

      const data = await response.json();
      await applyUpdate(data);
    } catch (error) {
      console.error("Voice processing error:", error);
      toast.error("Failed to process voice input");
    } finally {
      setIsExtracting(false);
    }
  }

  async function handleTextSubmit() {
    if (!textInput.trim()) return;

    try {
      setIsExtracting(true);

      const currentRecipe = {
        title,
        description,
        ingredients: ingredients.map((i) => ({ name: i.name, isOptional: i.isOptional })),
      };

      const response = await fetch("/api/recipes/update-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentRecipe, text: textInput }),
      });

      if (!response.ok) {
        throw new Error("Failed to process text update");
      }

      const data = await response.json();
      await applyUpdate(data);
      setTextInput("");
    } catch (error) {
      console.error("Text processing error:", error);
      toast.error("Failed to process text input");
    } finally {
      setIsExtracting(false);
    }
  }

  async function applyUpdate(data: {
    title: string;
    description: string;
    ingredients: Array<{ name: string; isOptional: boolean }>;
  }) {
    // Validate ingredients against database
    const ingredientNames = data.ingredients.map((i) => i.name);
    const validation = await validateIngredients({ ingredientNames });

    // Show toast for unrecognized ingredients
    if (validation.unrecognized.length > 0) {
      toast.error(
        `The system does not recognize the following items yet: ${validation.unrecognized.join(", ")}`,
        { duration: 5000 }
      );
    }

    // Map validated ingredients
    const matchedIngredients = validation.matched.map((matched) => {
      const llmSuggestion = data.ingredients.find(
        (i) => i.name.toLowerCase() === matched.name.toLowerCase()
      );
      return {
        id: matched.id,
        name: matched.name,
        isOptional: llmSuggestion?.isOptional || false,
      };
    });

    // Apply changes immediately to form
    setTitle(data.title);
    setDescription(data.description);
    setIngredients(matchedIngredients);
  }

  function handleCancel() {
    // Revert to original state
    setTitle(originalState.title);
    setDescription(originalState.description);
    setIngredients(originalState.ingredients);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (ingredients.length === 0) {
      toast.error("At least one ingredient is required");
      return;
    }

    try {
      setIsSubmitting(true);

      const ingredientData = ingredients.map((ing) => ({
        ingredientId: ing.id,
        ingredientType: ing.isOptional ? ("optional" as const) : ("anchor" as const),
      }));

      await updateRecipe({
        recipeId: recipe.id,
        title: title.trim(),
        description: description.trim(),
        ingredients: ingredientData,
      });

      toast.success("Recipe updated successfully");
      onClose();
    } catch (error) {
      console.error("Failed to save recipe:", error);
      toast.error("Failed to save recipe");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    try {
      setIsSubmitting(true);
      await deleteRecipe({ recipeId: recipe.id });
      toast.success("Recipe deleted successfully");
      onClose();
    } catch (error) {
      console.error("Failed to delete recipe:", error);
      toast.error("Failed to delete recipe");
    } finally {
      setIsSubmitting(false);
    }
  }

  function toggleIngredientOptional(index: number) {
    setIngredients((prev) =>
      prev.map((ing, i) =>
        i === index ? { ...ing, isOptional: !ing.isOptional } : ing
      )
    );
  }

  function removeIngredient(index: number) {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-4">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b-2 border-black">
            <h2 className="text-3xl font-bold">Edit Recipe</h2>
            <Button variant="ghost" onClick={onClose} size="icon">
              <span className="text-2xl">✕</span>
            </Button>
          </div>

          <QuickInputSection
            inputMode={inputMode}
            textValue={textInput}
            onInputModeChange={setInputMode}
            onTextChange={setTextInput}
            onTextSubmit={handleTextSubmit}
            onVoiceComplete={handleVoiceComplete}
            disabled={isExtracting}
            textPlaceholder="Describe changes to your recipe..."
            submitButtonText="Update"
            multiline={false}
            showVoiceGuidance={true}
            voiceGuidanceContext="recipe-update"
          />

          {isExtracting && (
            <div className="space-y-4 animate-pulse">
              <div className="h-12 bg-gray-200 border-2 border-black rounded shadow-md"></div>
              <div className="h-24 bg-gray-200 border-2 border-black rounded shadow-md"></div>
              <div className="h-40 bg-gray-200 border-2 border-black rounded shadow-md"></div>
              <p className="text-base text-center font-bold uppercase tracking-wide">
                Processing changes...
              </p>
            </div>
          )}

          {!isExtracting && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                  Title
                </label>
                <div className="w-full px-4 py-3 bg-gray-100 border-l-4 border-black rounded-sm min-h-[44px] flex items-center">
                  {title ? (
                    <span className="text-lg font-bold">{title}</span>
                  ) : (
                    <span className="text-muted-foreground italic">No title yet</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                  Description
                </label>
                <div className="w-full px-4 py-3 bg-gray-100 border-l-4 border-black rounded-sm min-h-[80px]">
                  {description ? (
                    <p className="text-base leading-relaxed">{description}</p>
                  ) : (
                    <span className="text-muted-foreground italic">No description yet</span>
                  )}
                </div>
              </div>

              {ingredients.length > 0 && (
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide mb-3">
                    Ingredients
                  </label>
                  <div className="space-y-2">
                    {ingredients.map((ing, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-white border-2 border-black rounded shadow-sm">
                        <span className="text-base font-medium flex-1">
                          {ing.name}
                        </span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleIngredientOptional(index)}
                            className={`text-xs font-bold px-3 py-1 rounded border-2 border-black transition-all cursor-pointer hover:translate-y-[-2px] active:translate-y-0 ${
                              ing.isOptional
                                ? "bg-gray-200 hover:bg-gray-300"
                                : "bg-primary text-primary-foreground hover:bg-primary-hover"
                            }`}
                          >
                            {ing.isOptional ? "Optional" : "Required"}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeIngredient(index)}
                            className="text-xl text-gray-400 hover:text-red-600 w-8 h-8 flex items-center justify-center rounded hover:bg-red-50 transition-all cursor-pointer"
                            aria-label="Remove ingredient"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-6">
                <Button type="submit" disabled={isSubmitting} className="flex-1" size="lg">
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  size="lg"
                >
                  Cancel
                </Button>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-200">
                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isSubmitting}
                    className="text-sm text-red-600 hover:text-red-800 hover:underline disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Delete Recipe
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Are you sure you want to delete this recipe?
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded border-2 border-black shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        {isSubmitting ? "Deleting..." : "Yes, Delete"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}
