import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { IoHeart, IoHeartOutline } from "react-icons/io5";

export default function RecipeDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [adjustedServings, setAdjustedServings] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchRecipe = async () => {
      try {
        const response = await fetch(`/api/recipes/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        const result = await response.json();
        setRecipe(result);
        setAdjustedServings(result.Servings);
        setIsFavorite(result.isFavorite || false);

        const recentlyViewed = JSON.parse(
          localStorage.getItem("recentlyViewed") || "[]"
        );
        const updatedViewed = [
          id,
          ...recentlyViewed.filter((recipeId) => recipeId !== id),
        ].slice(0, 10);
        localStorage.setItem("recentlyViewed", JSON.stringify(updatedViewed));
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const toggleFavorite = async () => {
    try {
      const response = await fetch("/api/favorites", {
        method: isFavorite ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId: id }),
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this recipe?")) {
      return;
    }

    try {
      const response = await fetch(`/api/recipes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete recipe");
      }
      router.push("/");
    } catch (error) {
      alert("Error deleting recipe: " + error.message);
    }
  };

  const getScaledQuantity = (originalQuantity) => {
    if (!recipe || !adjustedServings) return originalQuantity;
    const scalingRatio = adjustedServings / recipe.Servings;
    const scaled = originalQuantity * scalingRatio;
    const rounded = Math.round(scaled * 100) / 100;
    return rounded % 1 === 0 ? rounded.toFixed(0) : rounded;
  };

  return error ? (
    <div className="flex justify-center items-center min-h-screen">
      <p>{error}</p>
    </div>
  ) : loading ? (
    <div className="flex justify-center items-center min-h-screen">
      <svg
        className="size-10 animate-spin text-black"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  ) : recipe ? (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full h-96 relative">
        <img
          src={
            recipe.Photo_URL ||
            "https://via.placeholder.com/1200x400?text=No+Image"
          }
          alt={recipe.RecipeName}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-4xl font-bold flex-1">{recipe.RecipeName}</h1>
            <button
              onClick={toggleFavorite}
              className="bg-white rounded-full p-3 shadow-lg hover:scale-110 transition-transform ml-4"
            >
              {isFavorite ? (
                <IoHeart className="text-red-500" size={32} />
              ) : (
                <IoHeartOutline className="text-gray-600" size={32} />
              )}
            </button>
          </div>
          <p className="text-gray-600 text-lg mb-4">
            {recipe.RecipeDescription}
          </p>
          {recipe.categories && recipe.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {recipe.categories.map((category: string) => (
                <span
                  key={category}
                  className="px-3 py-1 bg-[#dad7cd] text-[#344e41] text-sm rounded-full font-medium"
                >
                  {category}
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-6 text-gray-700 mb-6">
            <div>
              <span className="font-semibold">Prep Time:</span>{" "}
              {recipe.PrepTime} min
            </div>
            <div>
              <span className="font-semibold">Cook Time:</span>{" "}
              {recipe.CookTime} min
            </div>
            <div>
              <span className="font-semibold">Total Time:</span>{" "}
              {recipe.TotalTime} min
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold">Servings:</span>
              <div className="flex items-center gap-2 bg-[#dad7cd] rounded-lg px-3 py-1">
                <button
                  onClick={() =>
                    setAdjustedServings(Math.max(1, adjustedServings - 1))
                  }
                  className="text-[#344e41] hover:text-[#588157] font-bold text-xl"
                  disabled={adjustedServings <= 1}
                >
                  −
                </button>
                <span className="font-semibold min-w-[2rem] text-center text-[#344e41]">
                  {adjustedServings}
                </span>
                <button
                  onClick={() => setAdjustedServings(adjustedServings + 1)}
                  className="text-[#344e41] hover:text-[#588157] font-bold text-xl"
                >
                  +
                </button>
              </div>
              {adjustedServings !== recipe.Servings && (
                <button
                  onClick={() => setAdjustedServings(recipe.Servings)}
                  className="text-sm text-[#588157] hover:text-[#344e41] underline"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => router.push(`/recipes/${id}/edit`)}
              className="bg-[#588157] text-white px-6 py-2 rounded hover:bg-[#344e41] transition"
            >
              Edit Recipe
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
            >
              Delete Recipe
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-[#344e41]">Ingredients</h2>
            {adjustedServings !== recipe.Servings && (
              <div className="mb-4 p-3 bg-[#dad7cd] border border-[#a3b18a] rounded-lg text-sm text-[#344e41]">
                Quantities adjusted for {adjustedServings} servings (original:{" "}
                {recipe.Servings})
              </div>
            )}
            <ul className="space-y-2">
              {recipe.ingredients && recipe.ingredients.length > 0 ? (
                recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-[#588157] mr-2">•</span>
                    <span>
                      {getScaledQuantity(ingredient.Quantity)} {ingredient.Unit}{" "}
                      {ingredient.IngredientName}
                    </span>
                  </li>
                ))
              ) : (
                <p className="text-gray-500">No ingredients listed</p>
              )}
            </ul>
          </div>
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-[#344e41]">Instructions</h2>
            <div className="prose max-w-none">
              <p className="whitespace-pre-line text-gray-700 leading-relaxed">
                {recipe.Instructions}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex justify-center items-center min-h-screen">
      <p>No recipes with id {id}</p>
    </div>
  );
}
