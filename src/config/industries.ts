export const industries = [
  'Technology & Software',
  'Healthcare & Pharmaceuticals',
  'Financial Services & Banking',
  'Manufacturing & Industrial',
  'Retail & E-commerce',
  'Telecommunications',
  'Energy & Utilities',
  'Automotive & Transportation',
  'Media & Entertainment',
  'Others'
] as const;

export type Industry = typeof industries[number];