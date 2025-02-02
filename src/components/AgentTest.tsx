import { useState } from 'react';
import { Brain, Loader2 } from 'lucide-react';
import { ExecutiveSummaryAgent } from '../services/agents/executiveSummaryAgent';
import { FinancialAnalysisAgent } from '../services/agents/financialAnalysisAgent';
import { MarketResearchAgent } from '../services/agents/marketResearchAgent';
import { RiskAssessmentAgent } from '../services/agents/riskAssessmentAgent';
import type { BusinessCase } from '../types';

const testCase: BusinessCase = {
  companyName: "Tech Solutions Inc",
  projectName: "Market Expansion 2024",
  country: "United States",
  industry: "Technology & Software",
  capex: 1000000,
  opex: 500000,
  expectedRevenue: 2000000,
  investmentPeriod: 3,
  subscribers: 10000,
  growthRate: 15,
  arpu: 50
};

export default function AgentTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string>('');
  const [error, setError] = useState<string>('');

  const [activeAgent, setActiveAgent] = useState<'executive' | 'financial' | 'market' | 'risk'>('executive');
  const executiveSummaryAgent = new ExecutiveSummaryAgent();
  const financialAnalysisAgent = new FinancialAnalysisAgent();
  const marketResearchAgent = new MarketResearchAgent();
  const riskAssessmentAgent = new RiskAssessmentAgent();

  const handleTest = async () => {
    setIsLoading(true);
    setError('');
    setResults('');

    try {
      const result = activeAgent === 'market'
        ? await marketResearchAgent.generateMarketResearch(testCase)
        : activeAgent === 'executive'
        ? await executiveSummaryAgent.generateSummary(testCase)
        : activeAgent === 'risk'
        ? await riskAssessmentAgent.generateRiskAssessment(testCase)
        : await financialAnalysisAgent.generateAnalysis(testCase);

      setResults(result);
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
          <Brain className="h-6 w-6 text-primary-600" />
          AI Agent Testing Interface
        </h2>

        <div className="flex flex-wrap gap-2 sm:gap-4 mb-6">
          <button
            onClick={() => setActiveAgent('executive')}
            className={`flex-1 min-w-[160px] px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${activeAgent === 'executive'
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
          >
            Executive Summary Agent
          </button>
          <button
            onClick={() => setActiveAgent('financial')}
            className={`flex-1 min-w-[160px] px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${activeAgent === 'financial'
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
          >
            Financial Analysis Agent
          </button>
          <button
            onClick={() => setActiveAgent('market')}
            className={`flex-1 min-w-[160px] px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${activeAgent === 'market'
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
          >
            Market Research Agent
          </button>
          <button
            onClick={() => setActiveAgent('risk')}
            className={`flex-1 min-w-[160px] px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${activeAgent === 'risk'
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
          >
            Risk Assessment Agent
          </button>
        </div>

        <div className="mb-6">
          <h3 className="font-medium text-neutral-700 mb-2">Test Parameters:</h3>
          <pre className="bg-neutral-50 p-4 rounded-lg text-sm">
            {JSON.stringify(testCase, null, 2)}
          </pre>
        </div>

        <button
          onClick={handleTest}
          disabled={isLoading}
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent 
            text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none 
            focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading && (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              {activeAgent === 'executive' ? 'Generating Summary...' :
               activeAgent === 'financial' ? 'Analyzing Financials...' :
               activeAgent === 'risk' ? 'Assessing Risks...' :
               'Researching Market...'}
            </>
          )}
          {!isLoading && (
            activeAgent === 'executive' ? 'Test Executive Summary Agent' :
            activeAgent === 'financial' ? 'Test Financial Analysis Agent' :
            activeAgent === 'risk' ? 'Test Risk Assessment Agent' :
            'Test Market Research Agent'
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
            <h3 className="font-medium text-neutral-700 mb-2">
              {activeAgent === 'executive' ? 'Generated Summary:' :
               activeAgent === 'financial' ? 'Financial Analysis:' :
               activeAgent === 'risk' ? 'Risk Assessment:' :
               'Market Research:'}
            </h3>
            <div className="bg-neutral-50 p-4 rounded-lg">
              <div className="prose prose-sm max-w-none prose-headings:mb-3 prose-p:mb-2.5 
                prose-ul:my-2 prose-li:my-1 prose-h3:mt-6 prose-h4:mt-4" 
                dangerouslySetInnerHTML={{ __html: results }}>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}