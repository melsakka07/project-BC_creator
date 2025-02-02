import { BaseAgent } from './agents/baseAgent';
import type { BusinessCase } from '../types';
import { formatCurrency, formatPercentage } from '../utils/responseHelpers';
import { MARKET_DATA } from '../config/marketData';
import type { Industry } from '../config/industries';

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
    <h3 class="text-lg font-semibold text-neutral-800 mb-4">Market Analysis</h3>
    <div class="prose prose-sm text-neutral-600">
      [Detailed market analysis]
    </div>
  </div>
</div>`;

interface MarketData {
  marketSize: number;
  growthRate: number;
  trends: ReadonlyArray<{ trend: string; impact: string; description: string }>;
  competitors: ReadonlyArray<{ name: string; marketShare: number; strengths: ReadonlyArray<string> }>;
  opportunities: ReadonlyArray<string>;
  threats: ReadonlyArray<string>;
}

export class MarketResearchAgent extends BaseAgent {
  constructor() {
    super(SYSTEM_PROMPT);
  }

  async generateMarketResearch(data: BusinessCase): Promise<string> {
    try {
      const marketData = this.getMarketData(data.industry);
      
      const formattedMarketSize = formatCurrency(marketData.marketSize * 1000000);
      const formattedGrowthRate = formatPercentage(marketData.growthRate);

      const prompt = `Generate a market research report for:
Company: ${data.companyName}
Project: ${data.projectName}
Industry: ${data.industry}
Country: ${data.country}

Market Data:
- Market Size: ${formattedMarketSize}
- Growth Rate: ${formattedGrowthRate}
- Key Trends: ${marketData.trends.map(t => t.trend).join(', ')}
- Competitors: ${marketData.competitors.map(c => c.name).join(', ')}

Include analysis of:
1. Market size and growth potential
2. Competitive landscape
3. Key market trends
4. Growth opportunities
5. Potential threats`;

      const analysis = await this.generateCompletion([
        { role: 'user', content: prompt }
      ], 0.7);

      return analysis;

    } catch (error) {
      console.error('Error generating market research:', error);
      throw new Error('Failed to generate market research analysis');
    }
  }

  private getMarketData(industry: Industry): MarketData {
    if (industry === '') {
      return {
        marketSize: MARKET_DATA.defaultMarketSize,
        growthRate: MARKET_DATA.defaultGrowthRate,
        trends: MARKET_DATA.defaultTrends,
        competitors: MARKET_DATA.defaultCompetitors,
        opportunities: MARKET_DATA.defaultOpportunities,
        threats: MARKET_DATA.defaultThreats
      };
    }

    // Cast market data with proper types
    const marketSizes = MARKET_DATA.marketSizes as { [K in Industry]: number };
    const growthRates = MARKET_DATA.growthRates as { [K in Industry]: number };
    const trends = MARKET_DATA.trends as unknown as { [K in Industry]?: typeof MARKET_DATA.defaultTrends };
    const competitors = MARKET_DATA.competitors as unknown as { [K in Industry]?: typeof MARKET_DATA.defaultCompetitors };
    const opportunities = MARKET_DATA.opportunities as unknown as { [K in Industry]?: typeof MARKET_DATA.defaultOpportunities };
    const threats = MARKET_DATA.threats as unknown as { [K in Industry]?: typeof MARKET_DATA.defaultThreats };

    return {
      marketSize: marketSizes[industry] ?? MARKET_DATA.defaultMarketSize,
      growthRate: growthRates[industry] ?? MARKET_DATA.defaultGrowthRate,
      trends: trends[industry] ?? MARKET_DATA.defaultTrends,
      competitors: competitors[industry] ?? MARKET_DATA.defaultCompetitors,
      opportunities: opportunities[industry] ?? MARKET_DATA.defaultOpportunities,
      threats: threats[industry] ?? MARKET_DATA.defaultThreats
    };
  }
}