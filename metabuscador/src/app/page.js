"use client";
import { useState, useCallback, useEffect } from "react";
import axios from "axios";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  const fetchSuggestions = useCallback(async () => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`https://api.datamuse.com/sug?s=${query}`);

      setSuggestions(response.data.map(item => item.word));
      setSelectedSuggestionIndex(-1);
    } catch (err) {
      setError("No se pudieron obtener las sugerencias");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchSuggestions();
  }, [query, fetchSuggestions]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedSuggestionIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedSuggestionIndex(prev => 
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;
        case 'Enter':
          if (selectedSuggestionIndex !== -1) {
            setQuery(suggestions[selectedSuggestionIndex]);
            setSuggestions([]);
            setSelectedSuggestionIndex(-1);
          }
          break;
        case 'Escape':
          setSuggestions([]);
          setSelectedSuggestionIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [suggestions, selectedSuggestionIndex]);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!query.trim()) {
      setError("Por favor ingresa un término de búsqueda");
      return;
    }

    // Limpiar sugerencias al hacer la búsqueda
    setSuggestions([]);
    setSelectedSuggestionIndex(-1);

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      if (!process.env.NEXT_PUBLIC_KEY || !process.env.NEXT_PUBLIC_CX) {
        throw new Error("Faltan las credenciales de API");
      }

      // Búsqueda combinada de texto e imágenes
      const textSearchResponse = await axios.get("https://www.googleapis.com/customsearch/v1", {
        params: {
          key: process.env.NEXT_PUBLIC_KEY,
          cx: process.env.NEXT_PUBLIC_CX,
          q: query,
          searchType: "image"
        },
      });

      if (textSearchResponse.data.items) {
        setResults(textSearchResponse.data.items);
      }

    } catch (err) {
      console.error("Error completo:", err.response ? err.response.data : err.message);
      setError(err.response?.data?.error?.message || err.message || "Ocurrió un error durante la búsqueda");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-800">Metabuscador TechForge</h1>

      <form onSubmit={handleSearch} className="mb-6" aria-live="polite">
        <div className="flex flex-col gap-2 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
            placeholder="¿Qué deseas buscar?"
            aria-label="Búsqueda"
            required
          />
          {query && suggestions.length > 0 && !loading && (
            <ul 
              className="absolute top-full left-0 w-full bg-white border border-gray-200 mt-1 rounded-lg shadow-lg z-10"
              onMouseLeave={() => setSelectedSuggestionIndex(-1)}
            >
              {suggestions.map((suggestion, index) => (
                <li 
                  key={index} 
                  className={`p-3 cursor-pointer transition-colors duration-200 
                    ${index === selectedSuggestionIndex 
                      ? 'bg-gray-200 text-red-500' 
                      : 'hover:bg-gray-100 text-black hover:text-red-500'}`}
                  onClick={() => {
                    setQuery(suggestion);
                    setSuggestions([]);
                  }}
                  onMouseEnter={() => setSelectedSuggestionIndex(index)}
                > 
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
          <button
            type="submit"
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 disabled:bg-gray-300"
            disabled={loading}
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>
      </form>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Resultados combinados con imágenes */}
      <div className="space-y-4">
        {results.map((result, index) => (
          <div 
            key={index} 
            className="flex border border-gray-300 p-4 rounded-lg shadow-md transition-shadow duration-200 hover:shadow-lg"
          >
            {/* Miniatura de imagen */}
            <div className="mr-4 flex-shrink-0">
              <a 
                href={result.link} 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label={`Ver imagen: ${result.title}`}
              >
                <img 
                  src={result.image.thumbnailLink} 
                  alt={result.title} 
                  className="w-32 h-32 object-cover rounded-md"
                />
              </a>
            </div>

            {/* Contenido de texto */}
            <div className="flex-grow">
              <h2 className="text-xl font-semibold mb-2">
                <a
                  href={result.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                  aria-label={`Abrir ${result.title}`}
                >
                  {result.title}
                </a>
              </h2>
              <p className="text-green-700 text-sm mb-1">{result.link}</p>
              <p className="text-gray-600">{result.snippet}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}