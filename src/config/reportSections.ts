import { FileText, DollarSign, TrendingUp, ShieldAlert, FileSpreadsheet } from 'lucide-react';
import type { BusinessCase } from '../types';
import type { ReportSectionConfig } from '../types/report';

export const reportSections: ReportSectionConfig[] = [
  {
    id: 'executiveSummary',
    title: 'Executive Summary',
    icon: FileText,
    generateContent: async (_data: BusinessCase) => ''
  },
  {
    id: 'financialAnalysis',
    title: 'Financial Analysis',
    icon: DollarSign,
    generateContent: async (_data: BusinessCase) => ''
  },
  {
    id: 'marketResearch',
    title: 'Market Research',
    icon: TrendingUp,
    generateContent: async (_data: BusinessCase) => ''
  },
  {
    id: 'riskAssessment',
    title: 'Risk Assessment',
    icon: ShieldAlert,
    generateContent: async (_data: BusinessCase) => ''
  },
  {
    id: 'summaryConclusion',
    title: 'Summary & Conclusion',
    icon: FileSpreadsheet,
    generateContent: async (_data: BusinessCase) => ''
  }
];