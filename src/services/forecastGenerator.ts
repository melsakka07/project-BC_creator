import type { BusinessCase } from '../types';

interface Projections {
  subscribers: number[];
  revenue: number[];
  profit: number[];
  cumulativeProfit: number[];
}

export function calculateProjections(data: BusinessCase): Projections {
  const subscribers: number[] = [];
  const revenue: number[] = [];
  const profit: number[] = [];
  const cumulativeProfit: number[] = [];
  let runningProfit = -data.capex; // Initial investment

  for (let year = 1; year <= data.investmentPeriod; year++) {
    // Calculate subscribers with linear growth
    const yearlySubscribers = Math.round(
      data.subscribers * (1 + (data.growthRate / 100) * year)
    );
    subscribers.push(yearlySubscribers);

    // Calculate revenue (ARPU * 12 months * subscribers + expected revenue)
    const yearlyRevenue = (data.arpu * 12 * yearlySubscribers) + data.expectedRevenue;
    revenue.push(yearlyRevenue);

    // Calculate yearly profit
    const yearlyProfit = yearlyRevenue - data.opex;
    profit.push(yearlyProfit);

    // Calculate cumulative profit
    runningProfit += yearlyProfit;
    cumulativeProfit.push(runningProfit);
  }

  return {
    subscribers,
    revenue,
    profit,
    cumulativeProfit
  };
}