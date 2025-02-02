import type { BusinessCase, BusinessCaseReport } from '../types';
import { BaseAgent } from './agents/baseAgent';
import { MarketResearchAgent } from './agents/marketResearchAgent';
import { RiskAssessmentAgent } from './agents/riskAssessmentAgent';
import { reportSections } from '../config/reportSections';
import { formatCurrency, formatNumber, formatPercentage } from '../utils/responseHelpers';

export class ReportGenerator extends BaseAgent {
  private marketResearchAgent: MarketResearchAgent;
  private riskAssessmentAgent: RiskAssessmentAgent;
  private report: Partial<BusinessCaseReport> = {};

  constructor() {
    super('');
    this.marketResearchAgent = new MarketResearchAgent();
    this.riskAssessmentAgent = new RiskAssessmentAgent();
  }

  async generateReport(data: BusinessCase): Promise<BusinessCaseReport> {
    // Initialize all sections as loading
    for (const section of reportSections) {
      this.report[section.id as keyof BusinessCaseReport] = {
        status: 'loading',
        content: ''
      };
    }

    // Generate all sections in parallel
    const promises = [
      this.generateExecutiveSummary(data),
      this.generateFinancialAnalysis(data),
      this.generateMarketResearch(data),
      this.generateRiskAssessment(data),
      this.generateSummaryConclusion(data)
    ];

    await Promise.all(promises);
    return this.report as BusinessCaseReport;
  }

  private async generateExecutiveSummary(data: BusinessCase): Promise<void> {
    try {
      const content = await this.generateCompletion([
        { role: 'user', content: this.getExecutiveSummaryPrompt(data) }
      ], 0.7);
      this.updateSection('executiveSummary', content);
    } catch (error) {
      this.handleSectionError('executiveSummary', error);
    }
  }

  private async generateFinancialAnalysis(data: BusinessCase): Promise<void> {
    try {
      const content = await this.generateCompletion([
        { role: 'user', content: this.getFinancialAnalysisPrompt(data) }
      ], 0.7);
      this.updateSection('financialAnalysis', content);
    } catch (error) {
      this.handleSectionError('financialAnalysis', error);
    }
  }

  private async generateMarketResearch(data: BusinessCase): Promise<void> {
    try {
      const content = await this.marketResearchAgent.generateMarketResearch(data);
      this.updateSection('marketResearch', content);
    } catch (error) {
      this.handleSectionError('marketResearch', error);
    }
  }

  private async generateRiskAssessment(data: BusinessCase): Promise<void> {
    try {
      const content = await this.riskAssessmentAgent.generateRiskAssessment(data);
      this.updateSection('riskAssessment', content);
    } catch (error) {
      this.handleSectionError('riskAssessment', error);
    }
  }

  private async generateSummaryConclusion(data: BusinessCase): Promise<void> {
    try {
      const prompt = `Generate a comprehensive summary and conclusion for the business case:

Company: ${data.companyName}
Project: ${data.projectName}
Industry: ${data.industry}
Country: ${data.country}

Investment Details:
- CapEx: ${formatCurrency(data.capex)}
- OpEx: ${formatCurrency(data.opex)}/year
- Period: ${data.investmentPeriod} years
- Growth Rate: ${formatPercentage(data.growthRate)}
- ARPU: ${formatCurrency(data.arpu)}/month
- Initial Subscribers: ${formatNumber(data.subscribers)}
- Expected Revenue: ${formatCurrency(data.expectedRevenue)}/year

Please provide a final summary and conclusion that synthesizes all aspects of the business case,
including market opportunity, financial projections, risks, and strategic recommendations.
Format the response using the same HTML structure as other sections.`;

      const content = await this.generateCompletion([
        { role: 'user', content: prompt }
      ], 0.8);
      
      this.updateSection('summaryConclusion', content);
    } catch (error) {
      this.handleSectionError('summaryConclusion', error);
    }
  }

  private updateSection(sectionId: keyof BusinessCaseReport, content: string): void {
    this.report[sectionId] = {
      status: 'complete',
      content
    };
  }

  private handleSectionError(sectionId: keyof BusinessCaseReport, error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    this.report[sectionId] = {
      status: 'error',
      content: '',
      error: errorMessage
    };
  }

  private getExecutiveSummaryPrompt(data: BusinessCase): string {
    return `Generate an executive summary for the business case:

Company: ${data.companyName}
Project: ${data.projectName}
Industry: ${data.industry}
Country: ${data.country}

Investment Details:
- CapEx: ${formatCurrency(data.capex)}
- OpEx: ${formatCurrency(data.opex)}/year
- Period: ${data.investmentPeriod} years
- Growth Rate: ${formatPercentage(data.growthRate)}
- ARPU: ${formatCurrency(data.arpu)}/month
- Initial Subscribers: ${formatNumber(data.subscribers)}
- Expected Revenue: ${formatCurrency(data.expectedRevenue)}/year

Please provide a concise executive summary that highlights the key aspects of the business case.
Format the response using HTML with appropriate headings and paragraphs.`;
  }

  private getFinancialAnalysisPrompt(data: BusinessCase): string {
    return `Generate a financial analysis for the business case:

Company: ${data.companyName}
Project: ${data.projectName}
Industry: ${data.industry}
Country: ${data.country}

Investment Details:
- CapEx: ${formatCurrency(data.capex)}
- OpEx: ${formatCurrency(data.opex)}/year
- Period: ${data.investmentPeriod} years
- Growth Rate: ${formatPercentage(data.growthRate)}
- ARPU: ${formatCurrency(data.arpu)}/month
- Initial Subscribers: ${formatNumber(data.subscribers)}
- Expected Revenue: ${formatCurrency(data.expectedRevenue)}/year

Please provide a detailed financial analysis including:
1. Investment overview
2. Revenue projections
3. Cost analysis
4. Key financial metrics
5. ROI calculations

Format the response using HTML with appropriate headings, paragraphs, and lists.`;
  }
}