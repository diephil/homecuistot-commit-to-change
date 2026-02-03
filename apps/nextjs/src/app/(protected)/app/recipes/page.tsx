"use client";

import { useState, useEffect, useCallback } from "react";
import { PageContainer } from "@/components/PageContainer";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { RecipeForm } from "@/components/recipes/RecipeForm";
import { RecipeHelpModal } from "@/components/recipes/HelpModal";
import { RecipeVoiceGuidanceCard } from "@/components/recipes/VoiceGuidanceCard";
import { RecipeProposalModal } from "@/components/recipes/RecipeProposalModal";
import { NeoHelpButton } from "@/components/shared/NeoHelpButton";
import { DeleteConfirmationModal } from "@/components/shared/DeleteConfirmationModal";
import { VoiceTextInput, Separator, SectionHeader } from "@/components/shared";
import { getRecipes, deleteRecipe, toggleIngredientType } from "@/app/actions/recipes";
import { Info } from "lucide-react";
import { toast } from "sonner";
import type {
  RecipeManagerProposal,
  RecipeToolResult,
  UpdateRecipeResult,
} from "@/types/recipe-agent";

interface Recipe {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  recipeIngredients: Array<{
    id: string;
    ingredientType: string;
    ingredientId: string | null;
    unrecognizedItemId: string | null;
    ingredient: {
      id: string;
      name: string;
      category: string;
    } | null;
  }>;
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Voice/text input state
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastTranscription, setLastTranscription] = useState<string | undefined>();
  const [assistantResponse, setAssistantResponse] = useState<string | undefined>();

  // Proposal modal state
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [currentProposal, setCurrentProposal] = useState<RecipeManagerProposal | null>(null);

  // Banner dismiss state (persisted in localStorage)
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    try {
      if (typeof window === "undefined") return false;
      return localStorage.getItem("banner:recipes:dismissed") === "true";
    } catch { return false; }
  });

  const handleBannerDismiss = () => {
    try { localStorage.setItem("banner:recipes:dismissed", "true"); } catch {}
    setBannerDismissed(true);
  };

  const handleBannerRestore = () => {
    try { localStorage.removeItem("banner:recipes:dismissed"); } catch {}
    setBannerDismissed(false);
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  async function loadRecipes() {
    try {
      setIsLoading(true);
      const data = await getRecipes();
      setRecipes(data);
    } catch (error) {
      console.error("Failed to load recipes:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleRecipeEdit(recipeId: string) {
    setSelectedRecipeId(recipeId);
    setIsFormOpen(true);
  }

  function handleRecipeDeleteClick(recipe: Recipe) {
    setRecipeToDelete(recipe);
    setDeleteModalOpen(true);
  }

  async function handleConfirmDelete() {
    if (!recipeToDelete) return;

    try {
      setIsDeleting(true);
      await deleteRecipe({ recipeId: recipeToDelete.id });
      toast.success("Recipe deleted successfully");
      setDeleteModalOpen(false);
      setRecipeToDelete(null);
      loadRecipes();
    } catch (error) {
      console.error("Failed to delete recipe:", error);
      toast.error("Failed to delete recipe");
    } finally {
      setIsDeleting(false);
    }
  }

  function handleCancelDelete() {
    setDeleteModalOpen(false);
    setRecipeToDelete(null);
  }

  function handleFormClose(changed?: boolean) {
    setIsFormOpen(false);
    setSelectedRecipeId(null);
    if (changed) {
      loadRecipes();
    }
  }

  async function handleIngredientToggle(params: {
    recipeIngredientId: string;
    recipeId: string;
  }) {
    try {
      const { newType } = await toggleIngredientType(params);

      // Update local state for the specific ingredient
      setRecipes((prev) =>
        prev.map((recipe) =>
          recipe.id === params.recipeId
            ? {
                ...recipe,
                recipeIngredients: recipe.recipeIngredients.map((ing) =>
                  ing.id === params.recipeIngredientId
                    ? { ...ing, ingredientType: newType }
                    : ing
                ),
              }
            : recipe
        )
      );
    } catch (error) {
      console.error("Failed to toggle ingredient:", error);
      toast.error("Failed to update ingredient");
    }
  }

  // Merge update proposals with local recipe data to preserve ingredientIds
  const mergeProposalWithLocalData = useCallback(
    (proposal: RecipeManagerProposal): RecipeManagerProposal => {
      const mergedRecipes: RecipeToolResult[] = proposal.recipes.map((result) => {
        if (result.operation !== "update") {
          return result; // Create operations don't need merging
        }

        const updateResult = result as UpdateRecipeResult;
        const localRecipe = recipes.find((r) => r.id === updateResult.recipeId);

        if (!localRecipe) {
          return result; // Recipe not found locally, return as-is
        }

        // Build name -> ingredientId lookup from local recipe
        const nameToIngredientId = new Map<string, string>();
        for (const ri of localRecipe.recipeIngredients) {
          if (ri.ingredient && ri.ingredientId) {
            nameToIngredientId.set(ri.ingredient.name.toLowerCase(), ri.ingredientId);
          }
        }

        // Enrich proposed ingredients with ingredientIds from local data
        const enrichedIngredients = updateResult.proposedState.ingredients.map(
          (ing) => ({
            ...ing,
            ingredientId:
              ing.ingredientId ?? nameToIngredientId.get(ing.name.toLowerCase()),
          })
        );

        return {
          ...updateResult,
          proposedState: {
            ...updateResult.proposedState,
            ingredients: enrichedIngredients,
          },
        };
      });

      return {
        ...proposal,
        recipes: mergedRecipes,
      };
    },
    [recipes]
  );

  // Voice/text input handler
  const handleVoiceTextSubmit = useCallback(
    async (
      result: { type: "voice"; audioBlob: Blob } | { type: "text"; text: string }
    ) => {
      setIsProcessing(true);

      try {
        let body: { input?: string; audioBase64?: string };

        if (result.type === "voice") {
          // Convert blob to base64
          const arrayBuffer = await result.audioBlob.arrayBuffer();
          const base64 = btoa(
            new Uint8Array(arrayBuffer).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ""
            )
          );
          body = { audioBase64: base64 };
        } else {
          body = { input: result.text };
        }

        const response = await fetch("/api/recipes/agent-proposal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          throw new Error("Failed to process input");
        }

        const data = await response.json();
        const proposal = data.proposal as RecipeManagerProposal;
        const transcribedText = data.transcribedText as string | undefined;
        const assistantMsg = data.assistantResponse as string | undefined;
        // Update last transcription for voice inputs
        if (transcribedText) {
          setLastTranscription(transcribedText);
        }

        // Update assistant response if present
        if (assistantMsg) {
          setAssistantResponse(assistantMsg);
        }

        // Check if no changes detected
        if (proposal.noChangesDetected) {
          toast.info("No recipe updates detected");
          return;
        }

        // Merge update proposals with local recipe data to get ingredientIds
        const mergedProposal = mergeProposalWithLocalData(proposal);

        // Show proposal modal
        setCurrentProposal(mergedProposal);
        setProposalModalOpen(true);
      } catch (error) {
        console.error("Recipe agent error:", error);
        toast.error("Failed to process your request");
      } finally {
        setIsProcessing(false);
      }
    },
    [mergeProposalWithLocalData]
  );

  const handleProposalApplied = useCallback(() => {
    setProposalModalOpen(false);
    setCurrentProposal(null);
    loadRecipes();
  }, []);

  const handleProposalClose = useCallback(() => {
    setProposalModalOpen(false);
    setCurrentProposal(null);
  }, []);

  const selectedRecipe = selectedRecipeId
    ? recipes.find((r) => r.id === selectedRecipeId)
    : null;

  if (isLoading) {
    return (
      <PageContainer
        maxWidth="4xl"
        gradientFrom="from-yellow-50"
        gradientVia="via-amber-50"
        gradientTo="to-orange-50"
      >
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      maxWidth="4xl"
      gradientFrom="from-yellow-50"
      gradientVia="via-amber-50"
      gradientTo="to-orange-50"
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Cookbook</h1>
          <NeoHelpButton
            renderModal={({ isOpen, onClose }) => (
              <RecipeHelpModal isOpen={isOpen} onClose={onClose} />
            )}
          />
        </div>

        {/* Voice Input Section */}
        <div className="space-y-4">
          {!bannerDismissed ? (
            <RecipeVoiceGuidanceCard
              onDismiss={handleBannerDismiss}
            />
          ) : (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleBannerRestore}
                className="cursor-pointer border-2 border-black bg-cyan-200 p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                aria-label="Show voice guidance"
                title="Show voice guidance"
              >
                <Info className="h-4 w-4" />
              </button>
            </div>
          )}

          <VoiceTextInput
            onSubmit={handleVoiceTextSubmit}
            disabled={isProcessing}
            processing={isProcessing}
            textPlaceholder="Describe your recipe with ingredients..."
            lastTranscription={lastTranscription}
            assistantResponse={assistantResponse}
          />
        </div>

        <Separator />

        {/* Tracked Recipes Section */}
        <section className="space-y-4">
          <SectionHeader
            title="My go-to recipes"
            description={
              <>
                <span className="text-amber-500">★</span> marks mandatory ingredients, others are optional and the recipe can still be made without them.
              </>
            }
          />

          {recipes.length === 0 ? (
          <div className="text-center py-4 space-y-2">
            <p className="text-lg text-gray-600">No recipes yet</p>
            <p className="text-sm text-gray-500">
              Speak or type to add your first recipe
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onEdit={() => handleRecipeEdit(recipe.id)}
                onDelete={() => handleRecipeDeleteClick(recipe)}
                onIngredientToggle={handleIngredientToggle}
              />
            ))}
          </div>
        )}
        </section>

        {isFormOpen && (
          <RecipeForm
            recipe={selectedRecipe}
            onClose={handleFormClose}
          />
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        itemName={recipeToDelete?.name || ""}
        itemType="recipe"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={isDeleting}
      />

      {currentProposal && (
        <RecipeProposalModal
          isOpen={proposalModalOpen}
          proposal={currentProposal}
          onClose={handleProposalClose}
          onProposalApplied={handleProposalApplied}
          transcription={lastTranscription}
        />
      )}
    </PageContainer>
  );
}
