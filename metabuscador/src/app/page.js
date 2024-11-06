"use client";
import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      // Verifica que las variables de entorno estén definidas
      if (!process.env.NEXT_PUBLIC_GOOGLE_API_KEY || !process.env.NEXT_PUBLIC_SEARCH_ENGINE_ID) {
        throw new Error('Faltan las credenciales de API');
      }

      const response = await axios({
        method: 'GET',
        url: 'https://www.googleapis.com/customsearch/v1',
        params: {
          key: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
          cx: process.env.NEXT_PUBLIC_SEARCH_ENGINE_ID,
          q: query
        }
      }).catch(function(error) {
        if (error.response) {
          // La solicitud se realizó y el servidor respondió con un código de estado
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
          throw new Error(`Error ${error.response.status}: ${error.response.data.error?.message || 'Error en la búsqueda'}`);
        } else if (error.request) {
          // La solicitud se realizó pero no se recibió respuesta
          console.log(error.request);
          throw new Error('No se recibió respuesta del servidor');
        } else {
          // Algo sucedió en la configuración de la solicitud que provocó un error
          console.log('Error', error.message);
          throw new Error('Error al configurar la solicitud');
        }
      });

      if (response.data.items) {
        setResults(response.data.items);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.log('Error completo:', err);
      setError(err.message || 'Ocurrió un error durante la búsqueda');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Buscador Google</h1>
      
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 border p-2 rounded"
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

      {loading && (
        <div className="text-center py-4">
          <p>Buscando resultados...</p>
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
          </div>
        ))}
      </div>

      {!loading && results.length === 0 && query && !error && (
        <p className="text-center text-gray-600 py-4">
          No se encontraron resultados para tu búsqueda.
        </p>
      )}
    </main>
  );
}