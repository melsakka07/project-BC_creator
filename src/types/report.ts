import type { LucideIcon } from 'lucide-react';
import type { BusinessCase } from './index';

export interface ReportSectionConfig {
  id: string;
  title: string;
  icon: LucideIcon;
  generateContent: (data: BusinessCase) => string | Promise<string>;
}

export interface ReportGenerator {
  generateReport: (data: BusinessCase) => Promise<BusinessCaseReport>;
}