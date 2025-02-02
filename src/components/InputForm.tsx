import React from 'react';
import type { BusinessCase, BusinessCaseParameters } from '../types';
import { Building2, Globe, Factory, DollarSign, TrendingUp, LineChart, Clock, Users, Percent, Wallet } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { industries } from '../config/industries';
import Tooltip from './Tooltip';

interface FieldTooltip {
  title: string;
  description: string;
}

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
}

interface InputField {
  name: keyof BusinessCase;
  label: string;
  icon: LucideIcon;
  type: 'text' | 'number' | 'select';
  placeholder?: string;
  tooltip?: FieldTooltip;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  validation?: ValidationRule;
  options?: Array<{ value: number; label: string }>;
}

interface FieldGroup {
  title: string;
  fields: InputField[];
}

interface InputFormProps {
  onSubmit: (data: BusinessCase) => Promise<void>;
  isLoading: boolean;
  parameters: BusinessCaseParameters;
  onParameterToggle: (parameter: keyof BusinessCaseParameters) => void;
  theme: 'light' | 'dark';
}

const validationRules: Record<keyof BusinessCase, ValidationRule> = {
  companyName: { required: true, minLength: 2, maxLength: 100 },
  projectName: { required: true, minLength: 2, maxLength: 100 },
  country: { required: true, minLength: 2, maxLength: 100 },
  industry: { required: true },
  capex: { required: true, min: 0, max: 1000000000 },
  opex: { required: true, min: 0, max: 1000000000 },
  expectedRevenue: { required: true, min: 0, max: 10000000000 },
  investmentPeriod: { required: true, min: 1, max: 5 },
  subscribers: { required: true, min: 0, max: 10000000 },
  growthRate: { required: true, min: 0, max: 1000 },
  arpu: { required: true, min: 0, max: 10000 },
};

export default function InputForm({ onSubmit, isLoading, parameters, onParameterToggle }: InputFormProps) {
  const [formData, setFormData] = React.useState<BusinessCase>({
    companyName: '',
    projectName: '',
    country: '',
    industry: '',
    capex: 0,
    opex: 0,
    expectedRevenue: 0,
    investmentPeriod: 3,
    subscribers: 0,
    growthRate: 0,
    arpu: 0,
  });

  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  const validateField = (name: keyof BusinessCase, value: any): string => {
    const rules = validationRules[name];
    if (!rules) return '';

    if (rules.required && !value) {
      return 'This field is required';
    }

    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        return `Minimum length is ${rules.minLength} characters`;
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        return `Maximum length is ${rules.maxLength} characters`;
      }
    }

    if (typeof value === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        return `Minimum value is ${rules.min}`;
      }
      if (rules.max !== undefined && value > rules.max) {
        return `Maximum value is ${rules.max}`;
      }
    }

    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newValue = e.target.type === 'number' ? parseFloat(value) || 0 : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    const error = validateField(name as keyof BusinessCase, newValue);
    setFieldErrors(prev => {
      if (error) {
        return { ...prev, [name]: error };
      } else {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
    });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    const error = validateField(name as keyof BusinessCase, value);
    setFieldErrors(prev => {
      if (error) {
        return { ...prev, [name]: error };
      } else {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const errors: Record<string, string> = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key as keyof BusinessCase, formData[key as keyof BusinessCase]);
      if (error) {
        errors[key] = error;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    onSubmit(formData);
  };

  const fieldGroups: FieldGroup[] = [
    {
      title: 'Company Information',
      fields: [
        {
          name: 'companyName',
          label: 'Company Name',
          icon: Building2,
          type: 'text',
          placeholder: 'e.g., Acme Corporation',
          tooltip: {
            title: 'Company Name',
            description: 'Enter your company\'s legal business name as registered'
          },
          validation: validationRules.companyName
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
          },
          validation: validationRules.projectName
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
          },
          validation: validationRules.country
        }
      ]
    },
    {
      title: 'Financial Details',
      fields: [
        {
          name: 'capex',
          label: 'Total Capital Expenditure (CapEx)',
          icon: DollarSign,
          type: 'number',
          placeholder: 'e.g., 1000000',
          min: 0,
          max: 1000000000,
          step: 1000,
          unit: 'USD',
          tooltip: {
            title: 'Capital Expenditure',
            description: 'One-time costs in USD for long-term assets (equipment, property, etc.)'
          },
          validation: validationRules.capex
        },
        {
          name: 'opex',
          label: 'Annual Operating Expenses (OpEx)',
          icon: TrendingUp,
          type: 'number',
          placeholder: 'e.g., 500000',
          min: 0,
          max: 1000000000,
          step: 1000,
          unit: 'USD',
          tooltip: {
            title: 'Operating Expenses',
            description: 'Annual recurring costs in USD for day-to-day operations'
          },
          validation: validationRules.opex
        },
        {
          name: 'expectedRevenue',
          label: 'Expected Annual Revenue (without ARPU)',
          icon: LineChart,
          type: 'number',
          placeholder: 'e.g., 2000000',
          min: 0,
          max: 10000000000,
          step: 1000,
          unit: 'USD',
          tooltip: {
            title: 'Expected Revenue',
            description: 'Projected annual revenue in USD from non-subscription sources'
          },
          validation: validationRules.expectedRevenue
        }
      ]
    },
    {
      title: 'Subscriber Metrics',
      fields: [
        {
          name: 'subscribers',
          label: 'Initial Number of Subscribers',
          icon: Users,
          type: 'number',
          placeholder: 'e.g., 10000',
          min: 0,
          max: 10000000,
          step: 100,
          unit: 'subscribers',
          tooltip: {
            title: 'Number of Subscribers',
            description: 'Total number of subscribers at project start'
          },
          validation: validationRules.subscribers
        },
        {
          name: 'growthRate',
          label: 'Annual Subscriber Growth Rate',
          icon: Percent,
          type: 'number',
          placeholder: 'e.g., 15',
          min: 0,
          max: 1000,
          step: 0.1,
          unit: '%',
          tooltip: {
            title: 'Annual Growth Rate',
            description: 'Expected yearly subscriber growth as a percentage'
          },
          validation: validationRules.growthRate
        },
        {
          name: 'arpu',
          label: 'Average Revenue Per User (ARPU)',
          icon: Wallet,
          type: 'number',
          placeholder: 'e.g., 50',
          min: 0,
          max: 10000,
          step: 0.01,
          unit: 'USD/month',
          tooltip: {
            title: 'ARPU',
            description: 'Average monthly revenue in USD generated per subscriber'
          },
          validation: validationRules.arpu
        }
      ]
    },
    {
      title: 'Investment Timeline',
      fields: [
        {
          name: 'investmentPeriod',
          label: 'Investment Period (Years)',
          icon: Clock,
          type: 'select',
          tooltip: {
            title: 'Investment Timeline',
            description: 'The number of years over which the business case will be evaluated'
          },
          validation: validationRules.investmentPeriod,
          options: [1, 2, 3, 4, 5].map(year => ({
            value: year,
            label: `${year} Year${year > 1 ? 's' : ''}`
          }))
        }
      ]
    }
  ];

  const renderField = (field: InputField) => {
    return (
      <div key={field.name} className="relative group">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200 
            flex items-center gap-2">
            <field.icon className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
            {field.label}
            {field.tooltip && <Tooltip content={field.tooltip} />}
          </label>
          <button
            type="button"
            aria-label={`Toggle ${field.label}`}
            onClick={() => onParameterToggle(field.name as keyof BusinessCaseParameters)}
            className={`relative inline-flex h-4 w-7 flex-shrink-0 cursor-pointer rounded-full 
              border-2 border-transparent transition-colors duration-200 ease-in-out 
              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 
              focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900
              ${parameters[field.name as keyof BusinessCaseParameters]
                ? 'bg-primary-500/90 hover:bg-primary-500'
                : 'bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600'
              }`}
          >
            <span
              className={`pointer-events-none inline-block h-3 w-3 transform rounded-full 
                bg-white shadow-sm ring-0 transition duration-200 ease-in-out
                ${parameters[field.name as keyof BusinessCaseParameters]
                  ? 'translate-x-3'
                  : 'translate-x-0'
                }`}
            />
          </button>
        </div>
        <div className="relative rounded-lg shadow-sm">
          {field.type === 'select' ? (
            <select
              name={field.name}
              id={field.name}
              aria-label={`Select ${field.label}`}
              value={formData[field.name as keyof BusinessCase]}
              onChange={handleSelectChange}
              disabled={!parameters[field.name as keyof BusinessCaseParameters]}
              className={`block w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base rounded-lg
                border ${fieldErrors[field.name] ? 'border-red-500 dark:border-red-500' : 'border-neutral-300 dark:border-neutral-600'}
                bg-white dark:bg-neutral-800 
                text-neutral-900 dark:text-neutral-100
                focus:ring-2 ${fieldErrors[field.name] ? 'focus:ring-red-500' : 'focus:ring-primary-500 dark:focus:ring-primary-400'}
                focus:border-primary-500 dark:focus:border-primary-400
                transition-colors duration-200
                disabled:bg-neutral-100 dark:disabled:bg-neutral-900
                disabled:text-neutral-500 dark:disabled:text-neutral-600
                disabled:border-neutral-200 dark:disabled:border-neutral-700
                ${!parameters[field.name as keyof BusinessCaseParameters] ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name as keyof BusinessCase]}
              onChange={handleChange}
              placeholder={field.placeholder}
              disabled={!parameters[field.name as keyof BusinessCaseParameters]}
              className={`block w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base rounded-lg
                border ${fieldErrors[field.name] ? 'border-red-500 dark:border-red-500' : 'border-neutral-300 dark:border-neutral-600'}
                bg-white dark:bg-neutral-800 
                text-neutral-900 dark:text-neutral-100
                placeholder:text-neutral-400 dark:placeholder:text-neutral-500
                focus:ring-2 ${fieldErrors[field.name] ? 'focus:ring-red-500' : 'focus:ring-primary-500 dark:focus:ring-primary-400'}
                focus:border-primary-500 dark:focus:border-primary-400
                transition-colors duration-200
                disabled:bg-neutral-100 dark:disabled:bg-neutral-900
                disabled:text-neutral-500 dark:disabled:text-neutral-600
                disabled:border-neutral-200 dark:disabled:border-neutral-700
                ${!parameters[field.name as keyof BusinessCaseParameters] ? 'opacity-50 cursor-not-allowed' : ''}`}
              {...(field.type === 'number' ? { min: field.min, max: field.max, step: field.step } : {})}
            />
          )}
          {field.unit && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-neutral-500 dark:text-neutral-400 text-sm sm:text-base">
                {field.unit}
              </span>
            </div>
          )}
        </div>
        {fieldErrors[field.name] && (
          <p className="mt-1 text-xs text-red-500 dark:text-red-400">
            {fieldErrors[field.name]}
          </p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto space-y-8 
      bg-white/70 dark:bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 
      shadow-lg dark:shadow-neutral-900/30 border border-white/20 
      dark:border-neutral-700/30">
      
      {/* Industry Selection */}
      <div className="space-y-6">
        <div className="relative">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200 
              flex items-center gap-2">
              <Factory className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
              Industry
              <Tooltip content={{
                title: 'Industry Sector',
                description: 'Select the primary industry sector for your business case'
              }} />
            </label>
            <button
              type="button"
              aria-label="Toggle Industry"
              onClick={() => onParameterToggle('industry')}
              className={`relative inline-flex h-4 w-7 flex-shrink-0 cursor-pointer rounded-full 
                border-2 border-transparent transition-colors duration-200 ease-in-out 
                focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 
                focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900
                ${parameters.industry
                  ? 'bg-primary-500/90 hover:bg-primary-500'
                  : 'bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600'
                }`}
            >
              <span
                className={`pointer-events-none inline-block h-3 w-3 transform rounded-full 
                  bg-white shadow-sm ring-0 transition duration-200 ease-in-out
                  ${parameters.industry ? 'translate-x-3' : 'translate-x-0'}`}
              />
            </button>
          </div>
          <select
            name="industry"
            id="industry"
            aria-label="Select Industry"
            value={formData.industry}
            onChange={handleSelectChange}
            disabled={!parameters.industry}
            className={`block w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base rounded-lg
              border ${fieldErrors.industry ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'}
              bg-white dark:bg-neutral-800 
              text-neutral-900 dark:text-neutral-100
              focus:ring-2 ${fieldErrors.industry ? 'focus:ring-red-500' : 'focus:ring-primary-500 dark:focus:ring-primary-400'}
              focus:border-primary-500 dark:focus:border-primary-400
              transition-colors duration-200
              disabled:bg-neutral-100 dark:disabled:bg-neutral-900
              disabled:text-neutral-500 dark:disabled:text-neutral-600
              disabled:border-neutral-200 dark:disabled:border-neutral-700
              ${!parameters.industry ? 'opacity-50 cursor-not-allowed' : ''}`}
            required
          >
            <option value="">Select an industry</option>
            {industries.filter(industry => industry !== '').map(industry => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
          {fieldErrors.industry && (
            <p className="mt-1 text-xs text-red-500 dark:text-red-400">
              {fieldErrors.industry}
            </p>
          )}
        </div>
      </div>

      {/* Field Groups */}
      {fieldGroups.map(group => (
        <div key={group.title} className="space-y-6">
          <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200">
            {group.title}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {group.fields.map(renderField)}
          </div>
        </div>
      ))}

      {/* Submit Button */}
      <div className="flex justify-end pt-6">
        <button
          type="submit"
          disabled={isLoading || Object.keys(fieldErrors).length > 0}
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 
            border border-transparent text-base font-medium rounded-xl text-white 
            bg-gradient-to-r from-primary-500 to-secondary-500 
            hover:from-primary-600 hover:to-secondary-600 
            focus:outline-none focus:ring-2 focus:ring-primary-500 
            focus:ring-offset-2 dark:focus:ring-offset-neutral-900
            disabled:opacity-50 disabled:cursor-not-allowed 
            shadow-lg hover:shadow-xl transition-all duration-200 
            transform hover:-translate-y-0.5"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" 
                  stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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