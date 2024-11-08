"use client";
import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [amazonPrice, setAmazonPrice] = useState(null); 

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('Por favor ingresa un término de búsqueda');
      return;
    }
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      if (!process.env.NEXT_PUBLIC_KEY || !process.env.NEXT_PUBLIC_CX) {
        throw new Error('Faltan las credenciales de API');
      }

      const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
          key: process.env.NEXT_PUBLIC_KEY,
          cx: process.env.NEXT_PUBLIC_CX,
          q: query
        }
      });

      if (response.data.items) {
        setResults(response.data.items);
      } else {
        setResults([]);
      }
    } catch (err) {
      setError(err.message || 'Ocurrió un error durante la búsqueda');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAmazonPrice = async (url) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/ScrapePrice`, {
        params: { url }
      });
      setAmazonPrice(response.data.price);
    } catch (err) {
      setError('Error al obtener el precio de Amazon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Metabuscador TechForge</h1>

      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 border p-2 rounded text-black"
            placeholder="¿Qué deseas buscar?"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
            disabled={loading}
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {results.map((result, index) => (
          <div key={index} className="border p-4 rounded shadow">
            <h2 className="text-xl mb-2">
              <a
                href={result.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {result.title}
              </a>
            </h2>
            <p className="text-green-700 text-sm mb-2">{result.link}</p>
            <p className="text-gray-600">{result.snippet}</p>
            {result.link.includes('amazon') && (
              <button
                onClick={() => handleAmazonPrice(result.link)}
                className="bg-green-500 text-white px-2 py-1 rounded mt-2 hover:bg-green-600"
              >
                Obtener precio de Amazon
              </button>
            )}
          </div>
        ))}
      </div>

      {amazonPrice && (
        <div className="mt-4 text-center bg-green-100 p-4 rounded border border-green-400">
          <p>Precio de Amazon: {amazonPrice}</p>
        </div>
      )}

      {!loading && results.length === 0 && query && !error && (
        <p className="text-center text-gray-600 py-4">
          No se encontraron resultados para tu búsqueda.
        </p>
      )}
    </main>
  );
}
