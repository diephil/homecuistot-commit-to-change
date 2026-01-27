"use client";

import { useState } from "react";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { createRecipe, updateRecipe, deleteRecipe, validateIngredients } from "@/app/actions/recipes";
import { VoiceInput } from "./voice-input";
import { toast } from "sonner";

interface RecipeFormProps {
  recipe?: {
    id: string;
    name: string;
    description: string | null;
    recipeIngredients: Array<{
      ingredient: {
        id: string;
        name: string;
      };
      ingredientType: string;
    }>;
  } | null;
  onClose: () => void;
}

export function RecipeForm(props: RecipeFormProps) {
  const { recipe, onClose } = props;
  const isEditMode = !!recipe;

  const [title, setTitle] = useState(recipe?.name || "");
  const [description, setDescription] = useState(recipe?.description || "");
  const [ingredients, setIngredients] = useState(
    recipe?.recipeIngredients.map((ri) => ({
      id: ri.ingredient.id,
      name: ri.ingredient.name,
      isOptional: ri.ingredientType === "optional",
    })) || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [textInput, setTextInput] = useState("");

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

      const response = await fetch("/api/recipes/process-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioBase64 }),
      });

      if (!response.ok) {
        throw new Error("Failed to process voice input");
      }

      const data = await response.json();
      await populateFromExtraction(data);
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
      const response = await fetch("/api/recipes/process-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textInput }),
      });

      if (!response.ok) {
        throw new Error("Failed to process text input");
      }

      const data = await response.json();
      await populateFromExtraction(data);
      setTextInput("");
    } catch (error) {
      console.error("Text processing error:", error);
      toast.error("Failed to process text input");
    } finally {
      setIsExtracting(false);
    }
  }

  async function populateFromExtraction(data: {
    title: string;
    description: string;
    ingredients: Array<{ name: string; isOptional: boolean }>;
  }) {
    setTitle(data.title);
    setDescription(data.description);

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

    // Set matched ingredients with LLM-suggested optional flags
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

    setIngredients(matchedIngredients);
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

      if (isEditMode) {
        await updateRecipe({
          recipeId: recipe.id,
          title: title.trim(),
          description: description.trim(),
          ingredients: ingredientData,
        });
        toast.success("Recipe updated successfully");
      } else {
        await createRecipe({
          title: title.trim(),
          description: description.trim(),
          ingredients: ingredientData,
        });
        toast.success("Recipe created successfully");
      }

      onClose();
    } catch (error) {
      console.error("Failed to save recipe:", error);
      toast.error("Failed to save recipe");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!isEditMode || !recipe) return;

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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {isEditMode ? "Edit Recipe" : "Add Recipe"}
            </h2>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>

          {!isEditMode && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-md">
              <p className="text-sm font-medium">Quick Add (Optional)</p>
              <div className="flex gap-2">
                <VoiceInput
                  onRecordingComplete={handleVoiceComplete}
                  disabled={isExtracting}
                />
                <span className="text-sm text-muted-foreground self-center">
                  or
                </span>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Describe your recipe..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    disabled={isExtracting}
                  />
                  <Button
                    type="button"
                    onClick={handleTextSubmit}
                    disabled={!textInput.trim() || isExtracting}
                    size="sm"
                  >
                    Extract
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isExtracting && (
            <div className="space-y-3 animate-pulse">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <p className="text-sm text-center text-muted-foreground">
                Extracting recipe...
              </p>
            </div>
          )}

          {!isExtracting && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Recipe title (max 100 chars)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={200}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description (max 200 chars)"
                />
              </div>

              {ingredients.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ingredients
                  </label>
                  <div className="space-y-2">
                    {ingredients.map((ing, index) => (
                      <div key={index} className="flex items-center justify-between gap-3 p-2 bg-gray-50 rounded-md">
                        <span className="text-sm font-medium flex-1">
                          {ing.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            ing.isOptional
                              ? "bg-gray-200 text-gray-700"
                              : "bg-blue-100 text-blue-700"
                          }`}>
                            {ing.isOptional ? "Optional" : "Required"}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleIngredientOptional(index)}
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            {ing.isOptional ? "Mark Required" : "Mark Optional"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? "Saving..." : isEditMode ? "Update" : "Create"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>

              {isEditMode && (
                <div className="pt-4 border-t">
                  {!showDeleteConfirm ? (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={isSubmitting}
                      className="w-full bg-red-500 hover:bg-red-600 text-white border-red-700"
                    >
                      Delete Recipe
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-center text-muted-foreground">
                        Confirm delete?
                      </p>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={handleDelete}
                          disabled={isSubmitting}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white border-red-700"
                        >
                          Confirm Delete
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={isSubmitting}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}
