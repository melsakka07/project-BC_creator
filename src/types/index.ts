import type { Industry } from '../config/industries';

export interface BusinessCase {
  companyName: string;
  projectName: string;
  country: string;
  industry: Industry;
  capex: number;
  opex: number;
  expectedRevenue: number;
  investmentPeriod: number;
  subscribers: number;
  growthRate: number;
  arpu: number;
}

export interface BusinessCaseParameters {
  companyName: boolean;
  projectName: boolean;
  country: boolean;
  industry: boolean;
  capex: boolean;
  opex: boolean;
  expectedRevenue: boolean;
  investmentPeriod: boolean;
  subscribers: boolean;
  growthRate: boolean;
  arpu: boolean;
}

export interface AgentResponse {
  content: string;
  status: 'loading' | 'complete' | 'error';
  error?: string;
}

export interface BusinessCaseReport {
  financialAnalysis: AgentResponse;
  marketResearch: AgentResponse;
  riskAssessment: AgentResponse;
  executiveSummary: AgentResponse;
  summaryConclusion: AgentResponse;
}