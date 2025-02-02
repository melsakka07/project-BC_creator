import type { MarketTrend, CompetitorInfo } from '../types/market';

export const MARKET_DATA = {
  marketSizes: {
    'Technology & Software': 500,
    'Healthcare & Pharmaceuticals': 400,
    'Financial Services & Banking': 600,
    'Manufacturing & Industrial': 300,
    'Retail & E-commerce': 450,
    'Telecommunications': 350,
    'Energy & Utilities': 250,
    'Automotive & Transportation': 200,
    'Media & Entertainment': 150,
  },
  defaultMarketSize: 100,

  growthRates: {
    'Technology & Software': 15,
    'Healthcare & Pharmaceuticals': 12,
    'Financial Services & Banking': 8,
    'Manufacturing & Industrial': 5,
    'Retail & E-commerce': 20,
    'Telecommunications': 10,
    'Energy & Utilities': 6,
    'Automotive & Transportation': 7,
    'Media & Entertainment': 18,
  },
  defaultGrowthRate: 8,

  trends: {
    'Technology & Software': [
      {
        trend: 'Cloud Computing Adoption',
        impact: 'positive',
        description: 'Increasing shift towards cloud-based solutions driving market growth'
      },
      {
        trend: 'AI Integration',
        impact: 'positive',
        description: 'Growing demand for AI-powered software solutions'
      }
    ],
    'Telecommunications': [
      {
        trend: '5G Network Expansion',
        impact: 'positive',
        description: 'Rapid deployment of 5G infrastructure creating new opportunities'
      },
      {
        trend: 'IoT Connectivity',
        impact: 'positive',
        description: 'Rising demand for IoT device connectivity and management'
      }
    ]
  },
  defaultTrends: [
    {
      trend: 'Digital Transformation',
      impact: 'positive',
      description: 'Ongoing digital transformation across industries'
    }
  ],

  competitors: {
    'Technology & Software': [
      {
        name: 'TechCorp Global',
        marketShare: 25,
        strengths: ['Strong R&D', 'Global Presence']
      },
      {
        name: 'InnovaSoft',
        marketShare: 15,
        strengths: ['Innovation', 'Customer Service']
      }
    ],
    'Telecommunications': [
      {
        name: 'GlobalComm',
        marketShare: 30,
        strengths: ['Network Infrastructure', 'Brand Recognition']
      },
      {
        name: 'TeleNet Solutions',
        marketShare: 20,
        strengths: ['Customer Base', 'Service Quality']
      }
    ]
  },
  defaultCompetitors: [
    {
      name: 'Market Leader Corp',
      marketShare: 20,
      strengths: ['Market Presence', 'Brand Recognition']
    }
  ],

  opportunities: {
    'Technology & Software': [
      'Growing demand for digital solutions in ${country}',
      'Increasing cloud adoption rates',
      'Rising cybersecurity concerns'
    ],
    'Telecommunications': [
      '5G network expansion in ${country}',
      'IoT device proliferation',
      'Digital transformation initiatives'
    ]
  },
  defaultOpportunities: [
    'Market expansion opportunities in ${country}',
    'Digital transformation trends',
    'Innovation potential'
  ],

  threats: {
    'Technology & Software': [
      'Rapid technological changes',
      'Cybersecurity risks',
      'Intense competition'
    ],
    'Telecommunications': [
      'Regulatory challenges',
      'Infrastructure costs',
      'Market saturation'
    ]
  },
  defaultThreats: [
    'Competitive pressure',
    'Regulatory changes',
    'Economic uncertainties'
  ]
} as const;