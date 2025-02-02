import { BaseAgent } from './baseAgent';
import type { BusinessCase } from '../../types';
import { formatCurrency, formatNumber, formatPercentage } from '../../utils/responseHelpers';
import { MARKET_DATA } from '../../config/marketData';
import { BraveSearchAgent } from '../braveSearchAgent';

const SYSTEM_PROMPT = `You are an expert market research analyst specializing in industry analysis. 
Create a comprehensive market research report using the following structure:
<div class="space-y-8">
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-2xl font-bold text-neutral-800">Market Research Report</h2>
      <p class="text-neutral-600">[Company Name] - [Project Name]</p>
    </div>
  </div>
  <div class="bg-white/50 rounded-xl p-6 backdrop-blur-sm">
    <h3 class="text-lg font-semibold text-neutral-800 mb-4">Market Overview</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="p-4 bg-neutral-50 rounded-lg">
        <h4 class="font-medium text-neutral-800 mb-2">Market Size & Growth</h4>
        [Market size and growth metrics]
      </div>
      <div class="p-4 bg-neutral-50 rounded-lg">
        <h4 class="font-medium text-neutral-800 mb-2">Industry Dynamics</h4>
        [Industry dynamics and indicators]
      </div>
    </div>
  </div>

  <div class="bg-white/50 rounded-xl p-6 backdrop-blur-sm">
    <h3 class="text-lg font-semibold text-neutral-800 mb-4">Competitive Landscape</h3>
    <div class="overflow-x-auto">
      <table class="min-w-full">
        <thead class="bg-neutral-50">
          <tr>
            <th class="px-4 py-2 text-left text-sm font-medium text-neutral-600">Competitor</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-neutral-600">Market Share</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-neutral-600">Strengths</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-100">
          [Competitor analysis]
        </tbody>
      </table>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div class="bg-white/50 rounded-xl p-6 backdrop-blur-sm">
      <h3 class="text-lg font-semibold text-neutral-800 mb-4">Market Trends</h3>
      <div class="space-y-4">
        [Market trends and analysis]
      </div>
    </div>
    <div class="bg-white/50 rounded-xl p-6 backdrop-blur-sm">
      <h3 class="text-lg font-semibold text-neutral-800 mb-4">Growth Opportunities</h3>
      <div class="space-y-4">
        [Growth opportunities and potential]
      </div>
    </div>
  </div>

  <div class="bg-white/50 rounded-xl p-6 backdrop-blur-sm">
    <h3 class="text-lg font-semibold text-neutral-800 mb-4">Market Entry Strategy</h3>
    <div class="prose prose-sm text-neutral-600">
      [Market entry recommendations and action plan]
    </div>
  </div>

  <div class="bg-white/50 rounded-xl p-6 backdrop-blur-sm">
    <h3 class="text-lg font-semibold text-neutral-800 mb-4">Web Research Insights</h3>
    <div class="prose prose-sm text-neutral-600">
      [Market insights from web research]
    </div>
  </div>
</div>

Important: Do not include any markdown code block indicators in your response.`;

export class MarketResearchAgent extends BaseAgent {
  private braveSearchAgent: BraveSearchAgent;

  constructor() {
    super(SYSTEM_PROMPT);
    this.braveSearchAgent = new BraveSearchAgent();
  }

  private async getMarketData(data: BusinessCase) {
    const marketSize = MARKET_DATA.marketSizes[data.industry] || MARKET_DATA.defaultMarketSize;
    const growthRate = MARKET_DATA.growthRates[data.industry] || MARKET_DATA.defaultGrowthRate;
    const trends = MARKET_DATA.trends[data.industry] || MARKET_DATA.defaultTrends;
    const competitors = MARKET_DATA.competitors[data.industry] || MARKET_DATA.defaultCompetitors;
    const opportunities = MARKET_DATA.opportunities[data.industry] || MARKET_DATA.defaultOpportunities;
    const threats = MARKET_DATA.threats[data.industry] || MARKET_DATA.defaultThreats;

    // Get real-time market insights with error handling
    let marketInsights = '';
    try {
      marketInsights = await this.braveSearchAgent.searchMarketInsights(data);
    } catch (error) {
      console.error('Error fetching market insights:', error);
      marketInsights = this.braveSearchAgent.getFallbackInsights();
    }

    return {
      marketSize,
      growthRate,
      trends,
      competitors,
      opportunities,
      threats,
      marketInsights
    };
  }

  private calculateMarketMetrics(data: BusinessCase, marketSize: number) {
    const totalAddressableMarket = marketSize * 1e9;
    const initialMarketShare = (data.subscribers * data.arpu * 12) / totalAddressableMarket * 100;
    const finalSubscribers = Math.round(data.subscribers * (1 + (data.growthRate / 100) * data.investmentPeriod));
    const finalMarketShare = (finalSubscribers * data.arpu * 12) / totalAddressableMarket * 100;
    
    return {
      totalAddressableMarket,
      initialMarketShare,
      finalMarketShare,
      finalSubscribers
    };
  }

  async generateMarketResearch(data: BusinessCase): Promise<string> {
    const research = await this.getMarketData(data);
    const { initialMarketShare, targetMarketShare } = this.calculateMarketMetrics(data, research);
    
    return `Market Research Analysis for ${data.companyName} in ${data.country}:

Threats:
${research.threats.map(threat => `• ${threat}`).join('\n')}

Real-Time Market Research:
${research.marketInsights}

Market Entry Strategy:
• Investment: ${formatCurrency(data.capex)} initial capital
• Operating Cost: ${formatCurrency(data.opex)} annual

Strategy Recommendations:
1. Focus on ${research.trends[0]?.trend.toLowerCase() || 'market trends'} to drive growth
2. Target competitive advantage in ${research.competitors[0]?.strengths[0].toLowerCase() || 'key areas'}
3. Leverage ${formatCurrency(data.arpu)} ARPU positioning for market penetration
4. Implement phased growth strategy targeting ${formatPercentage(data.growthRate)} annual growth`;
  }
}