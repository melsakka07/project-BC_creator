import type { BusinessCase, BusinessCaseReport, AgentResponse } from '../types';
import type { ReportSectionConfig } from '../types/report';
import { reportSections } from '../config/reportSections';
import { formatCurrency, formatNumber, formatPercentage } from '../utils/responseHelpers';
import { ExecutiveSummaryAgent } from './agents/executiveSummaryAgent';
import { FinancialAnalysisAgent } from './agents/financialAnalysisAgent';
import { MarketResearchAgent } from './agents/marketResearchAgent';
import { RiskAssessmentAgent } from './agents/riskAssessmentAgent';
import { createAgentResponse } from '../utils/responseHelpers';

export class ReportGenerator {
  private sections: ReportSectionConfig[];
  private executiveSummaryAgent: ExecutiveSummaryAgent;
  private financialAnalysisAgent: FinancialAnalysisAgent;
  private marketResearchAgent: MarketResearchAgent;
  private riskAssessmentAgent: RiskAssessmentAgent;

  constructor(sections = reportSections) {
    this.sections = sections;
    this.executiveSummaryAgent = new ExecutiveSummaryAgent();
    this.financialAnalysisAgent = new FinancialAnalysisAgent();
    this.marketResearchAgent = new MarketResearchAgent();
    this.riskAssessmentAgent = new RiskAssessmentAgent();
  }

  private initializeSections(): Partial<BusinessCaseReport> {
    return this.sections.reduce((report, section) => ({
      ...report,
      [section.id]: createAgentResponse({ status: 'loading' })
    }), {});
  }

  private async generateSectionContent(
    section: ReportSectionConfig,
    data: BusinessCase
  ): Promise<AgentResponse> {
    try {
      let content: string;
      
      switch (section.id) {
        case 'executiveSummary':
          content = await this.executiveSummaryAgent.generateSummary(data);
          break;
        case 'financialAnalysis':
          content = await this.financialAnalysisAgent.generateAnalysis(data);
          break;
        case 'marketResearch':
          content = await this.marketResearchAgent.generateMarketResearch(data);
          break;
        case 'riskAssessment':
          content = await this.riskAssessmentAgent.generateRiskAssessment(data);
          break;
        case 'summaryConclusion':
          // Generate conclusion after all other sections are complete
          content = await this.generateSummaryConclusion(data);
          break;
        default:
          content = await section.generateContent(data);
      }
      
      return createAgentResponse({ status: 'complete', content });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      return createAgentResponse({ status: 'error', error: errorMessage });
    }
  }

  private async generateSummaryConclusion(data: BusinessCase): Promise<string> {
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

    return this.executiveSummaryAgent.generateCompletion([
      { role: 'user', content: prompt }
    ], 0.8);
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  private formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  private formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  async generateReport(data: BusinessCase): Promise<BusinessCaseReport> {
    const report = this.initializeSections();

    try {
      // Generate all sections concurrently for better performance
      const sectionResults = await Promise.all(
        this.sections.map(section => this.generateSectionContent(section, data))
      );
      
      // Update report with results
      this.sections.forEach((section, index) => {
        report[section.id] = sectionResults[index];
      });

      return report as BusinessCaseReport;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  addSection(section: ReportSectionConfig) {
    this.sections.push(section);
  }

  removeSection(sectionId: string) {
    this.sections = this.sections.filter(section => section.id !== sectionId);
  }
}