import { useRouter } from "next/router";
import { useState, useEffect } from "react";

export default function RecipeDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    try {
      const fetchRecipe = async () => {
        const response = await fetch(`/api/recipes/id`);
      };
    } catch (error) {
      console.log(error);
    } finally {
    }
  }, [id]);

  // Display: loading, recipe info, ingredients list, instructions
}
