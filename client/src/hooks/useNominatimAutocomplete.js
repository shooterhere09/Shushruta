import { useState, useEffect } from 'react';

const useNominatimAutocomplete = (query) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    setError(null);

    const fetchSuggestions = async () => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
        const data = await response.json();
        setSuggestions(data);
      } catch (err) {
        setError("Failed to fetch suggestions");
        console.error("Nominatim API error:", err);
      } finally {
        setLoading(false);
      }
    };

    const handler = setTimeout(() => {
      fetchSuggestions();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  return { suggestions, loading, error };
};

export default useNominatimAutocomplete;