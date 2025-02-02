export interface MarketTrend {
  trend: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface CompetitorInfo {
  name: string;
  marketShare: number;
  strengths: string[];
}

export interface MarketResearchData {
  marketSize: number;
  growthRate: number;
  trends: MarketTrend[];
  competitors: CompetitorInfo[];
  opportunities: string[];
  threats: string[];
}