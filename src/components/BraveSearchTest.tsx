import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { BraveSearchAgent } from '../services/braveSearchAgent';

const braveSearchAgent = new BraveSearchAgent();

interface TestCase {
  companyName: string;
  projectName: string;
  country: string;
  industry: string;
}

export default function BraveSearchTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string>('');
  const [error, setError] = useState<string>('');

  const testCase: TestCase = {
    companyName: "Tech Solutions Inc",
    projectName: "Market Expansion 2024",
    country: "United States",
    industry: "Technology & Software"
  };

  const handleTest = async () => {
    setIsLoading(true);
    setError('');
    setResults('');

    try {
      if (!braveSearchAgent.isConfigured) {
        throw new Error(
          'Brave Search API is not configured. Please add your API key to the .env file:\n' +
          'VITE_BRAVE_API_KEY=your_api_key_here\n' +
          'VITE_BRAVE_API_ENDPOINT=https://api.search.brave.com/res/v1/web/search'
        );
      }

      const insights = await braveSearchAgent.searchMarketInsights({
        ...testCase,
        capex: 1000000,
        opex: 500000,
        expectedRevenue: 2000000,
        investmentPeriod: 3,
        subscribers: 10000,
        growthRate: 15,
        arpu: 50
      });

      setResults(insights);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during the test';
      setError(errorMessage);
      setResults(braveSearchAgent.getFallbackInsights());
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
          <h3 className="font-medium text-neutral-700 mb-2">Test Parameters:</h3>
          <pre className="bg-neutral-50 p-4 rounded-lg text-sm">
            {JSON.stringify(testCase, null, 2)}
          </pre>
        </div>

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
            'Run Test'
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
            <h3 className="font-medium text-neutral-700 mb-2">Results:</h3>
            <div className="bg-neutral-50 p-4 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap">{results}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}