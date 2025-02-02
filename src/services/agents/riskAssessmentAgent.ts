import { BaseAgent } from './baseAgent';
import type { BusinessCase } from '../../types';
import { formatCurrency, formatNumber, formatPercentage } from '../../utils/responseHelpers';

const SYSTEM_PROMPT = `You are an expert risk analyst specializing in business case risk assessment.
Create a comprehensive risk assessment report using the following structure:
<div class="space-y-8">
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-2xl font-bold text-neutral-800">Risk Assessment Report</h2>
      <p class="text-neutral-600">[Company Name] - [Project Name]</p>
    </div>
    <div class="flex items-center gap-2">
      <span class="px-3 py-1 rounded-full text-sm font-medium bg-[risk-level] text-white">
        Overall Risk: [Level]
      </span>
    </div>
  </div>

  <div class="bg-white/50 rounded-xl p-6 backdrop-blur-sm">
    <h3 class="text-lg font-semibold text-neutral-800 mb-4">Executive Summary</h3>
    <p class="text-neutral-700 leading-relaxed">
      [Concise overview of risk assessment findings]
    </p>
  </div>

  <div class="bg-white/50 rounded-xl p-6 backdrop-blur-sm">
    <h3 class="text-lg font-semibold text-neutral-800 mb-4">Key Risk Metrics</h3>
    <div class="overflow-x-auto">
      <table class="min-w-full">
        <thead class="bg-neutral-50">
          <tr>
            <th class="px-4 py-2 text-left text-sm font-medium text-neutral-600">Metric</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-neutral-600">Value</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-neutral-600">Risk Level</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-100">
          <tr>
            <td class="px-4 py-2 text-sm text-neutral-700">[Metric Name]</td>
            <td class="px-4 py-2 text-sm text-neutral-700">[Value]</td>
            <td class="px-4 py-2">
              <span class="px-2 py-1 rounded-full text-xs font-medium bg-[risk-level] text-white">
                [Risk Level]
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div class="bg-white/50 rounded-xl p-6 backdrop-blur-sm">
      <h3 class="text-lg font-semibold text-neutral-800 mb-4">Market & Growth Risks</h3>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <span class="text-neutral-700">Market Risk Level</span>
          <span class="px-2 py-1 rounded-full text-xs font-medium bg-[risk-level] text-white">
            [Risk Level]
          </span>
        </div>
        <div class="prose prose-sm text-neutral-600">
          [Market risk analysis and mitigation strategies]
        </div>
      </div>
    </div>

    [Repeat similar structure for Financial, Operational, and Strategic risks]
  </div>
  
  <div class="bg-white/50 rounded-xl p-6 backdrop-blur-sm">
    <h3 class="text-lg font-semibold text-neutral-800 mb-4">Risk Mitigation Plan</h3>
    <div class="space-y-4">
      <div class="prose prose-sm text-neutral-600">
        <h4 class="text-neutral-800 font-medium">Immediate Actions</h4>
        [List of immediate actions with expected impact]
        
        <h4 class="text-neutral-800 font-medium mt-4">Long-term Strategy</h4>
        [Long-term risk mitigation strategies]
      </div>
    </div>
  </div>

  <div class="bg-white/50 rounded-xl p-6 backdrop-blur-sm">
    <h3 class="text-lg font-semibold text-neutral-800 mb-4">Recommendations</h3>
    <div class="prose prose-sm text-neutral-600">
      [Key recommendations and next steps]
    </div>
  </div>
</div>

Important: Do not include any markdown code block indicators in your response.

Style Guidelines:
- Use consistent HTML structure and Tailwind classes
- Risk level colors: 
  • High Risk: bg-red-500
  • Medium Risk: bg-yellow-500
  • Low Risk: bg-green-500
- Maintain proper spacing and responsive layout
- Use semantic HTML elements for better accessibility
- Keep content concise and actionable`;

export class RiskAssessmentAgent extends BaseAgent {
  constructor() {
    super(SYSTEM_PROMPT);
  }

  private calculateRiskMetrics(data: BusinessCase) {
    const yearlyRevenue = data.subscribers * data.arpu * 12 + data.expectedRevenue;
    const operatingMargin = (yearlyRevenue - data.opex) / yearlyRevenue * 100;
    const estimatedMarketSize = data.subscribers * 10; // Conservative market size estimate
    const marketPenetration = (data.subscribers / estimatedMarketSize) * 100;
    const finalSubscribers = Math.round(data.subscribers * (1 + (data.growthRate / 100) * data.investmentPeriod));
    const finalRevenue = finalSubscribers * data.arpu * 12 + data.expectedRevenue;
    const revenueGrowth = ((finalRevenue / yearlyRevenue - 1) * 100);
    const breakEvenMonths = (data.capex / (yearlyRevenue - data.opex)) * 12;
    const cashBurnRate = data.opex / 12;
    const runwayMonths = data.capex / cashBurnRate;
    const customerAcquisitionCost = data.capex / (finalSubscribers - data.subscribers);

    return {
      yearlyRevenue,
      operatingMargin,
      marketPenetration,
      finalSubscribers,
      finalRevenue,
      revenueGrowth,
      breakEvenMonths,
      cashBurnRate,
      runwayMonths,
      customerAcquisitionCost,
      estimatedMarketSize
    };
  }

  async generateRiskAssessment(data: BusinessCase): Promise<string> {
    const metrics = this.calculateRiskMetrics(data);
    
    const prompt = `Generate a detailed risk assessment for the following business case:

Business Case Overview:
• Company: ${data.companyName}
• Project: ${data.projectName}
• Industry: ${data.industry}
• Market: ${data.country}

Investment Profile:
• Timeline: ${data.investmentPeriod} years
• Capital Expenditure: ${formatCurrency(data.capex)}
• Operating Expenses: ${formatCurrency(data.opex)}/year
• Revenue Target: ${formatCurrency(data.expectedRevenue)}/year

Market Position:
• Current Subscribers: ${formatNumber(data.subscribers)}
• Growth Target: ${formatPercentage(data.growthRate)}
• Market Share: ${formatPercentage(metrics.marketPenetration)}
• ARPU: ${formatCurrency(data.arpu)}/month
• TAM: ${formatNumber(metrics.estimatedMarketSize)} subscribers

Financial Indicators:
• Annual Revenue: ${formatCurrency(metrics.yearlyRevenue)}
• Operating Margin: ${formatPercentage(metrics.operatingMargin)}
• Projected Growth: ${formatPercentage(metrics.revenueGrowth)}
• Target Revenue: ${formatCurrency(metrics.finalRevenue)}
• Break-even: ${metrics.breakEvenMonths.toFixed(1)} months
• Monthly Burn Rate: ${formatCurrency(metrics.cashBurnRate)}
• Cash Runway: ${metrics.runwayMonths.toFixed(1)} months
• CAC: ${formatCurrency(metrics.customerAcquisitionCost)}

Risk Assessment Summary:
• Growth Risk: **${data.growthRate > 30 ? 'High' : data.growthRate > 20 ? 'Medium' : 'Low'}**
• Market Risk: **${metrics.marketPenetration > 20 ? 'High' : metrics.marketPenetration > 10 ? 'Medium' : 'Low'}**
• Financial Risk: **${metrics.operatingMargin < 20 ? 'High' : metrics.operatingMargin < 40 ? 'Medium' : 'Low'}**
• Operational Risk: **${metrics.runwayMonths < 12 ? 'High' : metrics.runwayMonths < 24 ? 'Medium' : 'Low'}**
• Acquisition Risk: **${metrics.customerAcquisitionCost > data.arpu * 24 ? 'High' : metrics.customerAcquisitionCost > data.arpu * 12 ? 'Medium' : 'Low'}**

Please provide a professional risk assessment report with clear sections, evidence-based risk ratings,
and actionable mitigation strategies based on these metrics and indicators.`;

    return this.generateCompletion([
      { role: 'user', content: prompt }
    ], 0.8);
  }
}