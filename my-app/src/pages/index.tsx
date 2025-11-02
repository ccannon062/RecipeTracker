import { useState, useEffect } from "react";

export default function Home() {
  // State for recipes, loading, error
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch recipes when component mounts
  useEffect(() => {
    // fetch('/api/recipes')
    // set recipes state
    // handle loading and errors
  }, []);

  // Render:
  // - Show loading spinner if loading
  // - Show error message if error
  // - Show "No recipes yet" if recipes is empty
  // - Show grid of recipe cards if recipes exist
}
