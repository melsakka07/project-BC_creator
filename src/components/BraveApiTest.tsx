import React, { useState } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { BraveSearchAgent } from '../services/braveSearchAgent';

const braveSearchAgent = new BraveSearchAgent();

export default function BraveApiTest() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [results, setResults] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState('technology market trends 2024');

  const handleTest = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      if (!braveSearchAgent.isConfigured) {
        throw new Error(
          'Brave Search API is not configured. Please add your API key to the .env file:\n' +
          'VITE_BRAVE_API_KEY=your_api_key_here\n' +
          'VITE_BRAVE_API_ENDPOINT=https://api.search.brave.com/res/v1/web/search'
        );
      }

      const response = await fetch('/api/brave-search?' + new URLSearchParams({
        q: query,
        count: '3',
        search_lang: 'en',
        safesearch: 'moderate',
        freshness: 'past_month',
        text_format: 'plain'
      }), {
        headers: {
          'Accept': 'application/json',
          'X-Subscription-Token': import.meta.env.VITE_BRAVE_API_KEY
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      setResults(JSON.stringify(data, null, 2));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during the test';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center gap-2">
          <Search className="h-6 w-6 text-primary-600" />
          Brave Search API Test
        </h2>

        <div className="mb-6">
          <label htmlFor="query" className="block text-sm font-medium text-neutral-700 mb-2">
            Test Query
          </label>
          <div className="flex gap-4">
            <input
              type="text"
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 block w-full rounded-lg border-neutral-300 shadow-sm
                focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Enter search query"
            />
            <button
              onClick={handleTest}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg
                text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2
                focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Testing API...
                </>
              ) : (
                'Test API'
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error:</h3>
              <pre className="mt-1 text-sm text-red-700 whitespace-pre-wrap font-mono">{error}</pre>
            </div>
          </div>
        )}

        {results && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-neutral-700 mb-2">API Response:</h3>
            <div className="bg-neutral-50 p-4 rounded-lg">
              {(() => {
                const data = JSON.parse(results);
                return (
                  <div className="space-y-6">
                    {data.web?.results?.map((result: any, index: number) => (
                      <div key={index} className="border-b border-neutral-200 pb-4 last:border-0">
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 font-medium block mb-2"
                        >
                          {result.title}
                        </a>
                        <p className="text-sm text-neutral-600 mb-2">{result.description}</p>
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                          <span>{result.age}</span>
                          {result.meta_url?.hostname && (
                            <>
                              <span>•</span>
                              <span>{result.meta_url.hostname}</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {data.videos?.results?.length > 0 && (
                      <div className="border-t border-neutral-200 pt-4 mt-4">
                        <h4 className="font-medium text-neutral-700 mb-3">Related Videos</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {data.videos.results.map((video: any, index: number) => (
                            <div key={index} className="bg-white rounded-lg shadow-sm p-3">
                              {video.thumbnail && (
                                <img
                                  src={video.thumbnail.src}
                                  alt={video.title}
                                  className="w-full h-32 object-cover rounded-lg mb-2"
                                />
                              )}
                              <a
                                href={video.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 hover:text-primary-700 text-sm font-medium block"
                              >
                                {video.title}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        <div className="mt-6 border-t border-neutral-200 pt-4">
          <h3 className="text-sm font-medium text-neutral-700 mb-2">API Configuration Help:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-neutral-600">
            <li>Visit <a href="https://brave.com/search/api/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">Brave Search API</a></li>
            <li>Sign up or log in to get your API key</li>
            <li>Create a <code className="px-2 py-1 bg-neutral-100 rounded text-xs">.env</code> file in your project root</li>
            <li>Add your API key and endpoint:
              <pre className="mt-2 p-3 bg-neutral-100 rounded-lg text-xs">
                VITE_BRAVE_API_KEY=your_api_key_here{'\n'}
                VITE_BRAVE_API_ENDPOINT=https://api.search.brave.com/res/v1/web/search
              </pre>
            </li>
            <li>Restart your development server</li>
          </ol>
        </div>
      </div>
    </div>
  );
}