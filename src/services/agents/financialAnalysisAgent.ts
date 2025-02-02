import { BaseAgent } from './baseAgent';
import type { BusinessCase } from '../../types';
import { formatCurrency, formatNumber, formatPercentage } from '../../utils/responseHelpers';

const SYSTEM_PROMPT = `You are an expert financial analyst specializing in business case analysis.
Create a comprehensive financial analysis using the following structure:
<div class="space-y-8">
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-2xl font-bold text-neutral-800">Financial Analysis</h2>
      <p class="text-neutral-600">[Company Name] - [Project Name]</p>
    </div>
  </div>
  <div class="bg-white/50 rounded-xl p-6 backdrop-blur-sm">
    <h3 class="text-lg font-semibold text-neutral-800 mb-4">Investment Overview</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="p-4 bg-neutral-50 rounded-lg">
        <h4 class="font-medium text-neutral-800 mb-2">Capital Structure</h4>
        [Capital expenditure breakdown]
      </div>
      <div class="p-4 bg-neutral-50 rounded-lg">
        <h4 class="font-medium text-neutral-800 mb-2">Operating Costs</h4>
        [Operating expenses breakdown]
      </div>
    </div>
  </div>
  <div class="bg-white/50 rounded-xl p-6 backdrop-blur-sm">
    <h3 class="text-lg font-semibold text-neutral-800 mb-4">Financial Projections</h3>
    <div class="overflow-x-auto">
      <table class="min-w-full">
        <thead class="bg-neutral-50">
          <tr>
            <th class="px-4 py-2 text-left text-sm font-medium text-neutral-600">Year</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-neutral-600">Revenue</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-neutral-600">Profit</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-neutral-600">Margin</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-100">
          [Year-by-year projections]
        </tbody>
      </table>
    </div>
  </div>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div class="bg-white/50 rounded-xl p-6 backdrop-blur-sm">
      <h3 class="text-lg font-semibold text-neutral-800 mb-4">Profitability Analysis</h3>
      <div class="space-y-4">
        [Profitability metrics and analysis]
      </div>
    </div>
    <div class="bg-white/50 rounded-xl p-6 backdrop-blur-sm">
      <h3 class="text-lg font-semibold text-neutral-800 mb-4">Key Performance Indicators</h3>
      <div class="space-y-4">
        [KPIs and financial ratios]
      </div>
    </div>
  </div>
  <div class="bg-white/50 rounded-xl p-6 backdrop-blur-sm">
    <h3 class="text-lg font-semibold text-neutral-800 mb-4">Return Analysis</h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      [ROI, payback period, and other return metrics]
    </div>
  </div>
  <div class="bg-white/50 rounded-xl p-6 backdrop-blur-sm">
    <h3 class="text-lg font-semibold text-neutral-800 mb-4">Recommendations</h3>
    <div class="prose prose-sm text-neutral-600">
      [Financial recommendations and action items]
    </div>
  </div>
</div>

Important: Do not include any markdown code block indicators in your response.`;

export class FinancialAnalysisAgent extends BaseAgent {
  constructor() {
    super(SYSTEM_PROMPT);
  }

  private calculateFinancialMetrics(data: BusinessCase) {
    const totalInvestment = data.capex + (data.opex * data.investmentPeriod);
    const annualizedCapex = data.capex / data.investmentPeriod;
    const monthlyOpex = data.opex / 12;

    const yearlyProjections = Array.from({ length: data.investmentPeriod }, (_, i) => {
      const year = i + 1;
      const subscribers = Math.round(data.subscribers * (1 + (data.growthRate / 100) * year));
      const subscriptionRevenue = subscribers * data.arpu * 12;
      const revenue = subscriptionRevenue + data.expectedRevenue;
      const operatingProfit = revenue - data.opex;
      const netProfit = operatingProfit - annualizedCapex;
      const operatingMargin = (operatingProfit / revenue) * 100;
      const netMargin = (netProfit / revenue) * 100;
      const cashFlow = netProfit + annualizedCapex; // Add back non-cash expense
      
      return {
        year,
        subscribers,
        subscriptionRevenue,
        revenue,
        operatingProfit,
        netProfit,
        operatingMargin,
        netMargin,
        cashFlow
      };
    });

    const totalRevenue = yearlyProjections.reduce((sum, year) => sum + year.revenue, 0);
    const totalOperatingProfit = yearlyProjections.reduce((sum, year) => sum + year.operatingProfit, 0);
    const totalNetProfit = yearlyProjections.reduce((sum, year) => sum + year.netProfit, 0);
    const totalCashFlow = yearlyProjections.reduce((sum, year) => sum + year.cashFlow, 0);
    
    const roi = (totalNetProfit / data.capex) * 100;
    const paybackPeriod = this.calculatePaybackPeriod(data.capex, yearlyProjections.map(p => p.cashFlow));
    const averageOperatingMargin = yearlyProjections.reduce((sum, year) => sum + year.operatingMargin, 0) / data.investmentPeriod;
    const averageNetMargin = yearlyProjections.reduce((sum, year) => sum + year.netMargin, 0) / data.investmentPeriod;

    // Calculate efficiency metrics
    const revenuePerEmployee = totalRevenue / (data.opex / 100000); // Assuming $100k per employee
    const subscriberAcquisitionCost = data.capex / (yearlyProjections[data.investmentPeriod - 1].subscribers - data.subscribers);
    
    return {
      totalInvestment,
      annualizedCapex,
      monthlyOpex,
      yearlyProjections,
      totalRevenue,
      totalOperatingProfit,
      totalNetProfit,
      totalCashFlow,
      roi,
      paybackPeriod,
      averageOperatingMargin,
      averageNetMargin,
      revenuePerEmployee,
      subscriberAcquisitionCost
    };
  }

  private calculatePaybackPeriod(capex: number, profits: number[]): number {
    let remainingCost = capex;
    for (let i = 0; i < profits.length; i++) {
      remainingCost -= profits[i];
      if (remainingCost <= 0) {
        // Calculate exact point within the year
        return i + (-remainingCost / profits[i]);
      }
    }
    return -1; // Investment not recovered within the period
  }

  async generateAnalysis(data: BusinessCase): Promise<string> {
    const metrics = this.calculateFinancialMetrics(data);
    const finalYear = metrics.yearlyProjections[data.investmentPeriod - 1];
    
    const prompt = `Generate a detailed financial analysis for the following business case:

Company: ${data.companyName}
Project: ${data.projectName}
Industry: ${data.industry}
Country: ${data.country}

Investment Structure:
Investment Components:
- CapEx: ${formatCurrency(data.capex)}
- Annualized CapEx: ${formatCurrency(metrics.annualizedCapex)}
- Annual OpEx: ${formatCurrency(data.opex)}
- Monthly OpEx: ${formatCurrency(metrics.monthlyOpex)}
- Investment Period: ${data.investmentPeriod} years
- Total Investment: ${formatCurrency(metrics.totalInvestment)}

Revenue Components:
Subscription Revenue Model:
- Monthly ARPU: ${formatCurrency(data.arpu)}
- Initial Subscribers: ${formatNumber(data.subscribers)}
- Final Subscribers: ${formatNumber(finalYear.subscribers)}
- Growth Rate: ${formatPercentage(data.growthRate)}

Additional Revenue Streams:
- Additional Revenue: ${formatCurrency(data.expectedRevenue)}/year

Yearly Projections:
${metrics.yearlyProjections.map(year => 
  `Year ${year.year}:
- Subscribers: ${formatNumber(year.subscribers)}
- Subscription Revenue: ${formatCurrency(year.subscriptionRevenue)}
- Total Revenue: ${formatCurrency(year.revenue)}
- Operating Profit: ${formatCurrency(year.operatingProfit)}
- Net Profit: ${formatCurrency(year.netProfit)}
- Cash Flow: ${formatCurrency(year.cashFlow)}
- Operating Margin: ${formatPercentage(year.operatingMargin)}
- Net Margin: ${formatPercentage(year.netMargin)}`
).join('\n')}

Financial Performance Metrics:
- Total Revenue: ${formatCurrency(metrics.totalRevenue)}
- Total Operating Profit: ${formatCurrency(metrics.totalOperatingProfit)}
- Total Net Profit: ${formatCurrency(metrics.totalNetProfit)}
- Total Cash Flow: ${formatCurrency(metrics.totalCashFlow)}
- ROI: ${formatPercentage(metrics.roi)}
- Payback Period: ${metrics.paybackPeriod.toFixed(2)} years
- Average Operating Margin: ${formatPercentage(metrics.averageOperatingMargin)}
- Average Net Margin: ${formatPercentage(metrics.averageNetMargin)}

Efficiency Metrics:
- Revenue Per Employee: ${formatCurrency(metrics.revenuePerEmployee)}
- Subscriber Acquisition Cost: ${formatCurrency(metrics.subscriberAcquisitionCost)}

Please provide a comprehensive analysis with clear sections, detailed explanations,
and specific recommendations based on these metrics.`;

    return this.generateCompletion([
      { role: 'user', content: prompt }
    ], 0.8);
  }
}