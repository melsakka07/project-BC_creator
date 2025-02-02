import React from 'react';
import { BusinessCase, BusinessCaseParameters } from '../types';
import { Building2, Globe, Factory, DollarSign, TrendingUp, LineChart, Clock, Users, Percent, Wallet, HelpCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { industries } from '../config/industries';

interface FieldTooltip {
  title: string;
  description: string;
}

interface InputField {
  name: keyof BusinessCase;
  label: string;
  icon: LucideIcon;
  type: string;
  placeholder: string;
  tooltip?: FieldTooltip;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

interface InputFormProps {
  onSubmit: (data: BusinessCase) => void;
  isLoading: boolean;
  parameters?: BusinessCaseParameters;
  onParameterToggle?: (parameter: keyof BusinessCaseParameters) => void;
}

const Tooltip: React.FC<{ content: FieldTooltip }> = ({ content }) => (
  <div className="group relative">
    <HelpCircle className="h-4 w-4 text-neutral-400 hover:text-primary-500 transition-colors cursor-help" />
    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-white rounded-lg shadow-lg text-sm text-neutral-700 z-10">
      <p className="font-medium mb-1">{content.title}</p>
      <p className="text-neutral-600 text-xs">{content.description}</p>
    </div>
  </div>
);

const defaultParameters: BusinessCaseParameters = {
  companyName: true,
  projectName: true,
  country: true,
  industry: true,
  capex: true,
  opex: true,
  expectedRevenue: true,
  investmentPeriod: true,
  subscribers: true,
  growthRate: true,
  arpu: true,
};

export default function InputForm({ onSubmit, isLoading, parameters = defaultParameters, onParameterToggle }: InputFormProps) {
  const [formData, setFormData] = React.useState<BusinessCase>({
    companyName: '',
    projectName: '',
    country: '',
    industry: 'Technology & Software',
    capex: 0,
    opex: 0,
    expectedRevenue: 0,
    investmentPeriod: 1,
    subscribers: 0,
    growthRate: 0,
    arpu: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'projectName' || name === 'country' || name === 'companyName'
        ? value
        : parseFloat(value) || 0
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggle = (parameter: keyof BusinessCaseParameters) => {
    if (onParameterToggle) {
      onParameterToggle(parameter);
    }
  };

  const Toggle: React.FC<{ name: keyof BusinessCaseParameters; enabled: boolean }> = ({ name, enabled }) => (
    <button
      type="button"
      aria-label={`Toggle ${name} field`}
      onClick={() => handleToggle(name)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
        enabled ? 'bg-primary-600' : 'bg-neutral-200'
      }`}
    >
      <span
        className={`${
          enabled ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
      />
    </button>
  );

  const inputFields: InputField[] = [
    {
      name: 'companyName',
      label: 'Company Name',
      icon: Building2,
      type: 'text',
      placeholder: 'e.g., Acme Corporation',
      tooltip: {
        title: 'Company Name',
        description: 'Enter your company\'s legal business name as registered'
      }
    },
    {
      name: 'projectName',
      label: 'Project Name',
      icon: Building2,
      type: 'text',
      placeholder: 'e.g., Market Expansion 2024',
      tooltip: {
        title: 'Project Name',
        description: 'A unique identifier for your business case project'
      }
    },
    {
      name: 'country',
      label: 'Country',
      icon: Globe,
      type: 'text',
      placeholder: 'e.g., United States',
      tooltip: {
        title: 'Target Country',
        description: 'Primary country where the project will be implemented'
      }
    },
    {
      name: 'capex',
      label: 'Capital Expenditure (CapEx)',
      icon: DollarSign,
      type: 'number',
      placeholder: 'e.g., 1000000',
      min: 0,
      step: 1000,
      unit: 'USD',
      tooltip: {
        title: 'Capital Expenditure',
        description: 'One-time costs in USD for long-term assets (equipment, property, etc.)'
      }
    },
    {
      name: 'opex',
      label: 'Annual Operating Expenses (OpEx)',
      icon: TrendingUp,
      type: 'number',
      placeholder: 'e.g., 500000',
      min: 0,
      step: 1000,
      unit: 'USD',
      tooltip: {
        title: 'Operating Expenses',
        description: 'Annual recurring costs in USD for day-to-day operations'
      }
    },
    {
      name: 'expectedRevenue',
      label: 'Expected Annual Revenue (without ARPU)',
      icon: LineChart,
      type: 'number',
      placeholder: 'e.g., 2000000',
      min: 0,
      step: 1000,
      unit: 'USD',
      tooltip: {
        title: 'Expected Revenue',
        description: 'Projected annual revenue in USD from non-subscription sources'
      }
    },
    {
      name: 'subscribers',
      label: 'Initial Number of Subscribers',
      icon: Users,
      type: 'number',
      placeholder: 'e.g., 10000',
      min: 0,
      step: 100,
      unit: 'subscribers',
      tooltip: {
        title: 'Number of Subscribers',
        description: 'Total number of subscribers at project start'
      }
    },
    {
      name: 'growthRate',
      label: 'Annual Subscriber Growth Rate',
      icon: Percent,
      type: 'number',
      placeholder: 'e.g., 15',
      min: 0,
      max: 100,
      step: 0.1,
      unit: '%',
      tooltip: {
        title: 'Annual Growth Rate',
        description: 'Expected yearly subscriber growth as a percentage'
      }
    },
    {
      name: 'arpu',
      label: 'Average Revenue Per User (ARPU)',
      icon: Wallet,
      type: 'number',
      placeholder: 'e.g., 50',
      min: 0,
      step: 0.01,
      unit: 'USD/month',
      tooltip: {
        title: 'ARPU',
        description: 'Average monthly revenue in USD generated per subscriber'
      }
    }
  ];

  const years = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full max-w-4xl backdrop-blur-sm bg-white/30 p-8 rounded-2xl shadow-lg border border-white/20">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-neutral-800 mb-2">Business Case Details</h2>
        <p className="text-neutral-600">Fill in the details below to generate your business case report. All fields are required.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Industry Dropdown */}
        <div className="relative">
          <label
            htmlFor="industry"
            className="flex items-center justify-between gap-2 text-sm font-medium text-neutral-700 mb-2"
          >
            <div className="flex items-center gap-2">
              Industry
              <Tooltip content={{
                title: 'Industry Sector',
                description: 'Select the primary industry sector for your business case'
              }} />
            </div>
            <Toggle name="industry" enabled={parameters.industry} />
          </label>
          <div className="relative rounded-xl shadow-sm group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Factory className="h-5 w-5 text-neutral-400 group-hover:text-primary-500 transition-colors" />
            </div>
            <select
              name="industry"
              id="industry"
              value={formData.industry}
              onChange={handleSelectChange}
              disabled={!parameters.industry}
              className="block w-full pl-12 pr-4 py-3 bg-white/50 border border-neutral-200 rounded-xl
                focus:ring-2 focus:ring-primary-500 focus:border-transparent
                hover:border-primary-300 transition-all duration-200
                text-neutral-800 placeholder-neutral-400 text-sm
                backdrop-blur-sm shadow-sm appearance-none"
              required
            >
              <option value="">Select an industry</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <svg className="h-4 w-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {inputFields.map(({ name, label, icon: Icon, type }) => (
          <div key={name} className="relative">
            <label
              htmlFor={name}
              className="flex items-center justify-between gap-2 text-sm font-medium text-neutral-700 mb-2"
            >
              <div className="flex items-center gap-2">
                {label}
                {inputFields.find(f => f.name === name)?.tooltip && (
                  <Tooltip content={inputFields.find(f => f.name === name)!.tooltip!} />
                )}
              </div>
              <Toggle name={name} enabled={parameters[name]} />
            </label>
            <div className="relative rounded-xl shadow-sm group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Icon className="h-5 w-5 text-neutral-400 group-hover:text-primary-500 transition-colors" />
              </div>
              <input
                type={type}
                name={name}
                id={name}
                value={formData[name as keyof BusinessCase]}
                onChange={handleChange}
                className="block w-full pl-12 pr-4 py-3 bg-white/50 border border-neutral-200 rounded-xl
                  focus:ring-2 focus:ring-primary-500 focus:border-transparent
                  hover:border-primary-300 transition-all duration-200
                  text-neutral-800 placeholder-neutral-400 text-sm
                  backdrop-blur-sm shadow-sm"
                required
                min={inputFields.find(f => f.name === name)?.min}
                max={inputFields.find(f => f.name === name)?.max}
                step={inputFields.find(f => f.name === name)?.step}
                disabled={!parameters[name]}
                placeholder={inputFields.find(f => f.name === name)?.placeholder}
              />
              {inputFields.find(f => f.name === name)?.unit && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-neutral-500 text-sm">{inputFields.find(f => f.name === name)?.unit}</span>
                </div>
              )}
            </div>
            {name === 'arpu' && (
              <p className="mt-1 text-xs text-neutral-500">
                Monthly revenue per subscriber, excluding one-time fees
              </p>
            )}
            {name === 'growthRate' && (
              <p className="mt-1 text-xs text-neutral-500">
                Linear growth projection, enter as percentage (0-100)
              </p>
            )}
          </div>
        ))}

        {/* Investment Period Dropdown */}
        <div className="relative">
          <label
            htmlFor="investmentPeriod"
            className="flex items-center justify-between gap-2 text-sm font-medium text-neutral-700 mb-2"
          >
            <div className="flex items-center gap-2">
              Investment Period (Years)
              <Tooltip content={{
                title: 'Investment Timeline',
                description: 'The number of years over which the business case will be evaluated'
              }} />
            </div>
            <Toggle name="investmentPeriod" enabled={parameters.investmentPeriod} />
          </label>
          <div className="relative rounded-xl shadow-sm group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Clock className="h-5 w-5 text-neutral-400 group-hover:text-primary-500 transition-colors" />
            </div>
            <select
              name="investmentPeriod"
              id="investmentPeriod"
              value={formData.investmentPeriod}
              onChange={handleSelectChange}
              disabled={!parameters.investmentPeriod}
              className="block w-full pl-12 pr-4 py-3 bg-white/50 border border-neutral-200 rounded-xl
                focus:ring-2 focus:ring-primary-500 focus:border-transparent
                hover:border-primary-300 transition-all duration-200
                text-neutral-800 placeholder-neutral-400 text-sm
                backdrop-blur-sm shadow-sm appearance-none"
              required
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year} {year === 1 ? 'Year' : 'Years'}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <svg className="h-4 w-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-xl
            text-white bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl
            transition-all duration-200 transform hover:-translate-y-0.5"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Report...
            </>
          ) : (
            'Generate Business Case'
          )}
        </button>
      </div>
    </form>
  );
}