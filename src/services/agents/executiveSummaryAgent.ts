import { BaseAgent } from './baseAgent';
import type { BusinessCase } from '../../types';
import { formatCurrency, formatNumber, formatPercentage } from '../../utils/responseHelpers';

const SYSTEM_PROMPT = `You are an expert business analyst specializing in executive summaries.
Create a professional executive summary using the following structure:
<div class="space-y-8">
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-2xl font-bold text-neutral-800">Executive Summary</h2>
      <p class="text-neutral-600">[Company Name] - [Project Name]</p>
    </div>
  </div>
  <div class="bg-white/50 rounded-xl p-6 backdrop-blur-sm">
    <h3 class="text-lg font-semibold text-neutral-800 mb-4">Overview</h3>
    <p class="text-neutral-700 leading-relaxed">
      [Brief project overview and key objectives]
    </p>
  </div>
  <div class="bg-white/50 rounded-xl p-6 backdrop-blur-sm">
    <h3 class="text-lg font-semibold text-neutral-800 mb-4">Key Metrics</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="p-4 bg-neutral-50 rounded-lg">
        <h4 class="font-medium text-neutral-800 mb-2">Investment</h4>
        <ul class="space-y-2 text-neutral-600">
          [Investment metrics]
        </ul>
      </div>
      <div class="p-4 bg-neutral-50 rounded-lg">
        <h4 class="font-medium text-neutral-800 mb-2">Growth</h4>
        <ul class="space-y-2 text-neutral-600">
          [Growth metrics]
        </ul>
      </div>
    </div>
  </div>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div class="bg-white/50 rounded-xl p-6 backdrop-blur-sm">
      <h3 class="text-lg font-semibold text-neutral-800 mb-4">Market Opportunity</h3>
      <div class="prose prose-sm text-neutral-600">
        [Market analysis and opportunity overview]
      </div>
    </div>
    <div class="bg-white/50 rounded-xl p-6 backdrop-blur-sm">
      <h3 class="text-lg font-semibold text-neutral-800 mb-4">Financial Impact</h3>
      <div class="prose prose-sm text-neutral-600">
        [Financial projections and impact analysis]
      </div>
    </div>
  </div>
  <div class="bg-white/50 rounded-xl p-6 backdrop-blur-sm">
    <h3 class="text-lg font-semibold text-neutral-800 mb-4">Recommendations</h3>
    <div class="prose prose-sm text-neutral-600">
      [Strategic recommendations and next steps]
    </div>
  </div>
</div>

Important: Do not include any markdown code block indicators in your response.`;

export class ExecutiveSummaryAgent extends BaseAgent {
  constructor() {
    super(SYSTEM_PROMPT);
  }

  async generateSummary(data: BusinessCase): Promise<string> {
    const totalInvestment = data.capex + (data.opex * data.investmentPeriod);
    const yearlyRevenue = (data.subscribers * data.arpu * 12) + data.expectedRevenue;
    const finalSubscribers = Math.round(data.subscribers * (1 + (data.growthRate / 100) * data.investmentPeriod));
    const finalRevenue = (finalSubscribers * data.arpu * 12) + data.expectedRevenue;

    const prompt = `Create an executive summary for the following business case:

Company: ${data.companyName}
Project: ${data.projectName}
Industry: ${data.industry}
Country: ${data.country}

Key Metrics:
- Initial Investment (CapEx): ${formatCurrency(data.capex)}
- Annual Operations (OpEx): ${formatCurrency(data.opex)}
- Investment Period: ${data.investmentPeriod} years
- Total Investment: ${formatCurrency(totalInvestment)}

Growth Metrics:
- Initial Subscribers: ${formatNumber(data.subscribers)}
- Growth Rate: ${formatPercentage(data.growthRate)}
- ARPU: ${formatCurrency(data.arpu)}/month
- Initial Annual Revenue: ${formatCurrency(yearlyRevenue)}
- Projected Final Revenue: ${formatCurrency(finalRevenue)}

Additional Revenue: ${formatCurrency(data.expectedRevenue)}/year`;

    return this.generateCompletion([
      { role: 'user', content: prompt }
    ], 0.7);
  }
}