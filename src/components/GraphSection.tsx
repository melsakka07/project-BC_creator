import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import type { BusinessCase } from '../types';
import { calculateProjections } from '../services/forecastGenerator';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface GraphSectionProps {
  data: BusinessCase;
}

export default function GraphSection({ data }: GraphSectionProps) {
  const projections = calculateProjections(data);
  const years = Array.from({ length: data.investmentPeriod }, (_, i) => `Year ${i + 1}`);

  const baseChartOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
    }
  };

  const growthChartOptions: ChartOptions<'line'> = {
    ...baseChartOptions,
    plugins: {
      ...baseChartOptions.plugins,
      title: {
        display: true,
        text: 'Business Case Projections',
        color: '#27272a',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Number of Subscribers',
          color: '#0284c7'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Revenue (USD)',
          color: '#c026d3'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const profitChartOptions: ChartOptions<'bar'> = {
    ...baseChartOptions,
    plugins: {
      ...baseChartOptions.plugins,
      title: {
        display: true,
        text: 'Yearly Profitability',
        color: '#27272a',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        title: {
          display: true,
          text: 'Profit (USD)',
          color: '#059669'
        }
      }
    }
  };

  const breakEvenChartOptions: ChartOptions<'line'> = {
    ...baseChartOptions,
    plugins: {
      ...baseChartOptions.plugins,
      title: {
        display: true,
        text: 'Break-Even Analysis',
        color: '#27272a',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        title: {
          display: true,
          text: 'Cumulative Profit (USD)',
          color: '#0d9488'
        }
      }
    }
  };

  const growthChartData = {
    labels: years,
    datasets: [
      {
        label: 'Subscribers',
        data: projections.subscribers,
        borderColor: '#0284c7',
        backgroundColor: '#0284c720',
        yAxisID: 'y',
        fill: true,
      },
      {
        label: 'Revenue',
        data: projections.revenue,
        borderColor: '#c026d3',
        backgroundColor: '#c026d320',
        yAxisID: 'y1',
        fill: true,
      }
    ],
  };

  const profitChartData = {
    labels: years,
    datasets: [
      {
        label: 'Yearly Profit',
        data: projections.profit,
        backgroundColor: '#059669',
        borderColor: '#047857',
        borderWidth: 1,
      }
    ]
  };

  const breakEvenChartData = {
    labels: years,
    datasets: [
      {
        label: 'Cumulative Profit',
        data: projections.cumulativeProfit,
        borderColor: '#0d9488',
        backgroundColor: '#0d948820',
        fill: true,
      }
    ]
  };

  const breakEvenYear = projections.cumulativeProfit.findIndex(profit => profit >= 0) + 1;

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20
      hover:shadow-xl transition-all duration-300 hover:bg-white/80">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-neutral-800 mb-2">
          Growth & Revenue Projections
        </h3>
        <p className="text-neutral-600">
          Projected subscriber growth and revenue over {data.investmentPeriod} years
        </p>
      </div>
      <div className="w-full aspect-[16/9]">
        <Line options={growthChartOptions} data={growthChartData} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="w-full aspect-[16/9]">
          <Bar options={profitChartOptions} data={profitChartData} />
        </div>
        <div className="w-full aspect-[16/9]">
          <Line options={breakEvenChartOptions} data={breakEvenChartData} />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-primary-50 rounded-xl">
          <h4 className="text-primary-700 font-medium mb-2">Subscriber Growth</h4>
          <p className="text-primary-600 mb-3">
            Starting with {data.subscribers.toLocaleString()} subscribers, 
            projected to reach {projections.subscribers[projections.subscribers.length - 1].toLocaleString()} 
            by Year {data.investmentPeriod}
          </p>
          <div className="text-sm text-primary-700 bg-primary-100/50 p-3 rounded-lg">
            <h5 className="font-medium mb-1">Formula:</h5>
            <code className="font-mono text-xs">
              Subscribers[Year n] = Initial Subscribers × (1 + Growth Rate){'\u207F'}
            </code>
            <p className="mt-1 text-xs">
              Where n is the year number and Growth Rate is {data.growthRate}%
            </p>
          </div>
        </div>
        <div className="p-4 bg-secondary-50 rounded-xl">
          <h4 className="text-secondary-700 font-medium mb-2">Revenue Growth</h4>
          <p className="text-secondary-600 mb-3">
            Projected annual revenue growth from ${(projections.revenue[0] / 1000000).toFixed(1)}M 
            to ${(projections.revenue[projections.revenue.length - 1] / 1000000).toFixed(1)}M
          </p>
          <div className="text-sm text-secondary-700 bg-secondary-100/50 p-3 rounded-lg">
            <h5 className="font-medium mb-1">Formula:</h5>
            <code className="font-mono text-xs">
              Revenue[Year n] = (Subscribers[Year n] × ARPU × 12) + Expected Revenue
            </code>
            <p className="mt-1 text-xs">
              Where ARPU is ${data.arpu}/month and Expected Revenue is ${data.expectedRevenue.toLocaleString()}/year
            </p>
          </div>
        </div>
        <div className="col-span-1 md:col-span-2 p-4 bg-neutral-50 rounded-xl">
          <h4 className="text-neutral-700 font-medium mb-2">Financial Metrics</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="text-sm text-neutral-700 bg-neutral-100/50 p-3 rounded-lg">
              <h5 className="font-medium mb-1">Total Cost of Ownership (TCO):</h5>
              <code className="font-mono text-xs">
                TCO = CapEx + (OpEx × Years)
              </code>
              <p className="mt-1 text-xs">
                TCO = ${data.capex.toLocaleString()} + (${data.opex.toLocaleString()} × {data.investmentPeriod}) = 
                ${(data.capex + data.opex * data.investmentPeriod).toLocaleString()} USD
              </p>
            </div>
            <div className="text-sm text-neutral-700 bg-neutral-100/50 p-3 rounded-lg">
              <h5 className="font-medium mb-1">Return on Investment (ROI):</h5>
              <code className="font-mono text-xs">
                ROI = ((Total Revenue - TCO) / CapEx) × 100
              </code>
              <p className="mt-1 text-xs">
                Calculated over {data.investmentPeriod} {data.investmentPeriod === 1 ? 'year' : 'years'}
              </p>
            </div>
          </div>
        </div>
        <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-emerald-50 rounded-xl">
          <div className="text-sm text-emerald-700 bg-emerald-100/50 p-3 rounded-lg">
            <h5 className="font-medium mb-1">Yearly Profit:</h5>
            <code className="font-mono text-xs">
              Profit[Year n] = Revenue[Year n] - OpEx
            </code>
            <p className="mt-1 text-xs">
              OpEx: ${data.opex.toLocaleString()}/year
            </p>
          </div>
          <div className="text-sm text-teal-700 bg-teal-100/50 p-3 rounded-lg">
            <h5 className="font-medium mb-1">Break-Even Analysis:</h5>
            <code className="font-mono text-xs">
              CumulativeProfit[Year n] = -CapEx + Σ(Profit[Year 1..n])
            </code>
            <p className="mt-1 text-xs">
              {breakEvenYear > 0 && breakEvenYear <= data.investmentPeriod
                ? `Break-even achieved in Year ${breakEvenYear}`
                : 'Break-even point not reached within the investment period'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}