import React from 'react';
import { BraveSearchAgent } from '../services/braveSearchAgent';
import { Loader2 } from 'lucide-react';

export default function BraveApiTest() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [results, setResults] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');

  const handleTest = async () => {
    setIsLoading(true);
    setError('');
    setResults('');

    try {
      const agent = new BraveSearchAgent();

      // Check if API is configured using a public method
      if (!agent.checkConfiguration()) {
        throw new Error('Brave Search API is not configured. Please add your API key to the .env file.');
      }

      const searchResults = await agent.searchMarketInsights({
        companyName: 'Test Company',
        projectName: 'Market Research',
        country: 'United States',
        industry: 'Technology & Software',
        capex: 1000000,
        opex: 500000,
        expectedRevenue: 2000000,
        investmentPeriod: 3,
        subscribers: 10000,
        growthRate: 15,
        arpu: 50
      });
      
      setResults(searchResults);
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
        <h2 className="text-2xl font-bold text-neutral-800 mb-4">
          Brave Search API Test
        </h2>

        <button
          onClick={handleTest}
          disabled={isLoading}
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent 
            text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none 
            focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Searching...
            </>
          ) : (
            'Test Brave Search API'
          )}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
            <h3 className="font-medium mb-2">Error:</h3>
            <pre className="text-sm whitespace-pre-wrap">{error}</pre>
          </div>
        )}

        {results && (
          <div className="mt-4">
            <h3 className="font-medium text-neutral-700 mb-2">Search Results:</h3>
            <div className="bg-neutral-50 p-4 rounded-lg">
              <div className="prose prose-sm max-w-none" 
                dangerouslySetInnerHTML={{ __html: results }}>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}