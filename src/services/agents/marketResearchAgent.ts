import { BaseAgent } from './baseAgent';
import type { BusinessCase } from '../../types';
import { formatCurrency, formatPercentage } from '../../utils/responseHelpers';
import { MARKET_DATA } from '../../config/marketData';
import type { Industry } from '../../config/industries';

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
      // Get market data with fallbacks
      const marketData = this.getMarketData(data.industry);
      
      // Format market size to billions/millions for readability
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
    // Handle empty string case by using default values
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

    // Get industry-specific data with fallbacks
    const marketSizes = MARKET_DATA.marketSizes as { [K in Industry]: number };
    const growthRates = MARKET_DATA.growthRates as { [K in Industry]: number };

    // Cast the entire trends object to allow safe indexing
    const trendsData = MARKET_DATA.trends as unknown as { 
      [K in Industry]?: ReadonlyArray<{ trend: string; impact: string; description: string }> 
    };

    // Cast the competitors object
    const competitorsData = MARKET_DATA.competitors as unknown as {
      [K in Industry]?: ReadonlyArray<{ name: string; marketShare: number; strengths: ReadonlyArray<string> }>
    };

    // Cast the opportunities and threats objects
    const opportunitiesData = MARKET_DATA.opportunities as unknown as {
      [K in Industry]?: ReadonlyArray<string>
    };

    const threatsData = MARKET_DATA.threats as unknown as {
      [K in Industry]?: ReadonlyArray<string>
    };

    return {
      marketSize: marketSizes[industry] ?? MARKET_DATA.defaultMarketSize,
      growthRate: growthRates[industry] ?? MARKET_DATA.defaultGrowthRate,
      trends: trendsData[industry] ?? MARKET_DATA.defaultTrends,
      competitors: competitorsData[industry] ?? MARKET_DATA.defaultCompetitors,
      opportunities: opportunitiesData[industry] ?? MARKET_DATA.defaultOpportunities,
      threats: threatsData[industry] ?? MARKET_DATA.defaultThreats
    };
  }
}