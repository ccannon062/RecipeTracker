import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  IoSearch,
  IoHeart,
  IoHeartOutline,
  IoStar,
  IoStarHalf,
  IoStarOutline,
} from "react-icons/io5";

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [maxPrepTime, setMaxPrepTime] = useState("");
  const [maxServings, setMaxServings] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <IoStar key={`full-${i}`} className="text-yellow-500" size={16} />
      );
    }
    if (hasHalfStar) {
      stars.push(
        <IoStarHalf key="half" className="text-yellow-500" size={16} />
      );
    }
    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <IoStarOutline key={`empty-${i}`} className="text-gray-400" size={16} />
      );
    }
    return stars;
  };

  useEffect(() => {
    const fetchRecipes = async () => {
      if (!initialLoad) {
        setLoading(true);
      }
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append("search", searchTerm);
        if (maxPrepTime) params.append("maxPrepTime", maxPrepTime);
        if (maxServings) params.append("maxServings", maxServings);
        if (sortBy) params.append("sortBy", sortBy);

        const url = `/api/recipes${
          params.toString() ? `?${params.toString()}` : ""
        }`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        const result = await response.json();
        setRecipes(result);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchRecipes();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, maxPrepTime, maxServings, sortBy, initialLoad]);

  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      const recentIds = JSON.parse(
        localStorage.getItem("recentlyViewed") || "[]"
      );
      if (recentIds.length === 0) {
        setRecentlyViewed([]);
        return;
      }

      try {
        const recentRecipes = await Promise.all(
          recentIds.slice(0, 5).map(async (id) => {
            const response = await fetch(`/api/recipes/${id}`);
            if (response.ok) {
              return await response.json();
            }
            return null;
          })
        );
        setRecentlyViewed(recentRecipes.filter((recipe) => recipe !== null));
      } catch (error) {
        console.error("Error fetching recently viewed recipes:", error);
      }
    };

    fetchRecentlyViewed();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    const fetchFavorites = async () => {
      try {
        const response = await fetch("/api/favorites");
        if (response.ok) {
          const data = await response.json();
          setFavoriteIds(data);
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };

    fetchCategories();
    fetchFavorites();
  }, []);

  const toggleFavorite = async (recipeId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const isFavorite = favoriteIds.includes(recipeId);

    try {
      const response = await fetch("/api/favorites", {
        method: isFavorite ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId }),
      });

      if (response.ok) {
        if (isFavorite) {
          setFavoriteIds(favoriteIds.filter((id) => id !== recipeId));
        } else {
          setFavoriteIds([...favoriteIds, recipeId]);
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const filteredRecipes = recipes.filter((recipe: any) => {
    if (showFavoritesOnly && !favoriteIds.includes(recipe.RecipeID)) {
      return false;
    }
    if (selectedCategory) {
      console.log('Recipe:', recipe.RecipeName, 'Categories:', recipe.categories, 'Selected:', selectedCategory);
      if (!recipe.categories || !recipe.categories.includes(selectedCategory)) {
        return false;
      }
    }
    return true;
  });

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>{error}</p>
      </div>
    );
  }

  if (initialLoad) {
    return (
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
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">All Recipes</h1>

      {recentlyViewed.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Recently Viewed</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {recentlyViewed.map((recipe) => (
              <Link key={recipe.RecipeID} href={`/recipes/${recipe.RecipeID}`}>
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer border border-gray-200">
                  <div className="relative w-full h-32">
                    <Image
                      src={
                        !recipe.Photo_URL || failedImages.has(recipe.RecipeID)
                          ? "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"
                          : recipe.Photo_URL
                      }
                      alt={recipe.RecipeName}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover"
                      onError={() => {
                        setFailedImages((prev) => new Set(prev).add(recipe.RecipeID));
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm line-clamp-2 text-[#344e41]">
                      {recipe.RecipeName}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {recipe.TotalTime} min
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mb-8 bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-4">
            <div className="relative">
              <IoSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#588157]"
                size={20}
              />
              <input
                type="text"
                placeholder="Search recipes by name or ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#588157] focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#344e41] mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#588157] focus:border-transparent outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((cat: any) => (
                <option key={cat.CategoryID} value={cat.CategoryName}>
                  {cat.CategoryName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#344e41] mb-2">
              Max Prep Time (min)
            </label>
            <input
              type="number"
              placeholder="Any"
              value={maxPrepTime}
              onChange={(e) => setMaxPrepTime(e.target.value)}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#588157] focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#344e41] mb-2">
              Max Servings
            </label>
            <input
              type="number"
              placeholder="Any"
              value={maxServings}
              onChange={(e) => setMaxServings(e.target.value)}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#588157] focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#344e41] mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#588157] focus:border-transparent outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="time-asc">Shortest Time</option>
              <option value="time-desc">Longest Time</option>
              <option value="servings-asc">Least Servings</option>
              <option value="servings-desc">Most Servings</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select>
          </div>

          <div className="flex items-start">
            <label className="flex items-center cursor-pointer mt-7">
              <input
                type="checkbox"
                checked={showFavoritesOnly}
                onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                className="w-4 h-4 text-[#588157] border-gray-300 rounded focus:ring-[#588157]"
              />
              <span className="ml-2 text-sm text-[#344e41]">
                Favorites Only
              </span>
            </label>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setMaxPrepTime("");
                setMaxServings("");
                setSortBy("newest");
                setSelectedCategory("");
                setShowFavoritesOnly(false);
              }}
              className="w-full px-4 py-2 bg-[#a3b18a] text-white rounded-lg hover:bg-[#588157] transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <svg
            className="size-8 animate-spin text-[#588157]"
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
      ) : filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe: any) => (
            <div
              key={recipe.RecipeID}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow h-full flex flex-col border border-gray-200 relative"
            >
              <button
                onClick={(e) => toggleFavorite(recipe.RecipeID, e)}
                className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
              >
                {favoriteIds.includes(recipe.RecipeID) ? (
                  <IoHeart className="text-red-500" size={24} />
                ) : (
                  <IoHeartOutline className="text-gray-600" size={24} />
                )}
              </button>
              <Link href={`/recipes/${recipe.RecipeID}`}>
                <div className="relative w-full h-48">
                  <Image
                    src={
                      !recipe.Photo_URL || failedImages.has(recipe.RecipeID)
                        ? "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"
                        : recipe.Photo_URL
                    }
                    alt={recipe.RecipeName}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover cursor-pointer"
                    onError={() => {
                      setFailedImages((prev) => new Set(prev).add(recipe.RecipeID));
                    }}
                  />
                </div>
                <div className="p-4 cursor-pointer">
                  <h2 className="text-xl font-bold mb-2 text-[#344e41]">
                    {recipe.RecipeName}
                  </h2>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {recipe.RecipeDescription}
                  </p>
                  {recipe.categories && recipe.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {recipe.categories.slice(0, 3).map((category: string) => (
                        <span
                          key={category}
                          className="px-2 py-1 bg-[#dad7cd] text-[#344e41] text-xs rounded-full"
                        >
                          {category}
                        </span>
                      ))}
                      {recipe.categories.length > 3 && (
                        <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                          +{recipe.categories.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>⏱️ {recipe.TotalTime} min</span>
                    <span>{recipe.Servings} servings</span>
                  </div>
                  {recipe.ratingCount > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex">
                        {renderStars(Number(recipe.averageRating || 0))}
                      </div>
                      <span className="text-xs text-gray-600">
                        ({recipe.ratingCount})
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            No recipes found matching your filters.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setMaxPrepTime("");
              setMaxServings("");
              setSortBy("newest");
              setSelectedCategory("");
              setShowFavoritesOnly(false);
            }}
            className="mt-4 px-6 py-2 bg-[#344e41] text-white rounded-lg hover:bg-[#588157] transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
