import type { AgentResponse } from '../types';

interface AgentResponseParams {
  status: AgentResponse['status'];
  content?: string;
  error?: string;
}

export function createAgentResponse({ status, content = '', error }: AgentResponseParams): AgentResponse {
  return {
    content,
    status,
    ...(error && { error })
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}