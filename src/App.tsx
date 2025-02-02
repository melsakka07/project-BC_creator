import React from 'react';
import { Brain, Download, FileSpreadsheet } from 'lucide-react';
import InputForm from './components/InputForm';
import ReportSection from './components/ReportSection';
import GraphSection from './components/GraphSection';
import type { BusinessCase, BusinessCaseReport, BusinessCaseParameters } from './types';
import { ReportGenerator } from './services/reportGenerator';
import { PdfGenerator } from './services/pdfGenerator';
import { reportSections } from './config/reportSections';
import { AlertCircle } from 'lucide-react';

const reportGenerator = new ReportGenerator();
const pdfGenerator = new PdfGenerator();

function App() {
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [report, setReport] = React.useState<BusinessCaseReport | null>(null);
  const [formData, setFormData] = React.useState<BusinessCase | null>(null);
  const [parameters, setParameters] = React.useState<BusinessCaseParameters>({
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
    arpu: true
  });

  const handleParameterToggle = (parameter: keyof BusinessCaseParameters) => {
    setParameters(prev => ({
      ...prev,
      [parameter]: !prev[parameter]
    }));
  };

  const handleDownloadHtml = () => {
    if (!report) return;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Business Case Report</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              line-height: 1.5;
              max-width: 900px;
              margin: 0 auto;
              padding: 2rem;
              color: #27272a;
              background: #fafafa;
            }
            h1 {
              font-size: 2.5rem;
              color: #0284c7;
              text-align: center;
              margin-bottom: 2rem;
            }
            h2 {
              font-size: 1.5rem;
              color: #0369a1;
              margin-top: 2rem;
              padding-bottom: 0.5rem;
              border-bottom: 2px solid #e0f2fe;
            }
            .section {
              background: white;
              padding: 1.5rem;
              margin: 1rem 0;
              border-radius: 0.5rem;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            pre {
              white-space: pre-wrap;
              font-family: inherit;
            }
          </style>
        </head>
        <body>
          <h1>Business Case Report</h1>
          
          ${reportSections.map(section => `
            <div class="section">
              <h2>${section.title}</h2>
              <pre>${report[section.id].content}</pre>
            </div>
          `).join('')}
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'business-case-report.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = () => {
    if (!report) return;
    pdfGenerator.generatePdf(report);
  };

  const handleSubmit = async (data: BusinessCase) => {
    setIsGenerating(true);
    setFormData(data);
    setApiError(null);
    
    // Filter out disabled parameters
    const filteredData = Object.entries(data).reduce((acc, [key, value]) => {
      if (parameters[key as keyof BusinessCaseParameters]) {
        acc[key as keyof BusinessCase] = value;
      }
      return acc;
    }, {} as Partial<BusinessCase>) as BusinessCase;

    try {
      const generatedReport = await reportGenerator.generateReport(filteredData);
      setReport(generatedReport);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      if (errorMessage.includes('API key')) {
        setApiError(errorMessage);
      } else {
        console.error('Error generating report:', error);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-xl blur-xl opacity-30 animate-float"></div>
              <FileSpreadsheet className="h-16 w-16 text-primary-600 relative animate-float" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-4 animate-gradient">
            Business Case Creator
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto font-medium">
            Create professional business cases powered by AI agents
          </p>
          {apiError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg max-w-2xl mx-auto">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-700 text-sm font-medium">
                    Configuration Error: {apiError}
                  </p>
                  <div className="mt-2 text-red-600 text-sm space-y-2">
                    <p>Please add your API keys to the .env file:</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>
                        Create an OpenAI API key at{' '}
                        <a
                          href="https://platform.openai.com/api-keys"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-red-800"
                        >
                          platform.openai.com/api-keys
                        </a>
                      </li>
                      <li>
                        Create a Brave Search API key at{' '}
                        <a
                          href="https://brave.com/search/api/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-red-800"
                        >
                          brave.com/search/api
                        </a>
                      </li>
                      <li>Add to your .env file:
                        <pre className="mt-1 p-2 bg-red-100 rounded text-xs font-mono">
                          VITE_OPENAI_API_KEY=your_openai_key_here{'\n'}
                          VITE_BRAVE_API_KEY=your_brave_key_here{'\n'}
                          VITE_BRAVE_API_ENDPOINT=https://api.search.brave.com/res/v1/web/search
                        </pre>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}
          {apiError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg max-w-2xl mx-auto">
              <p className="text-red-700 text-sm">
                <strong>Configuration Error:</strong> {apiError}
              </p>
              <p className="text-red-600 text-xs mt-2">
                Please add your API keys to the .env file:
                <br />
                1. Create an OpenAI API key at{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-red-800"
                >
                  platform.openai.com/api-keys
                </a>
                <br />
                2. Create a Brave Search API key at{' '}
                <a
                  href="https://brave.com/search/api/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-red-800"
                >
                  brave.com/search/api
                </a>
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center mb-12">
          <InputForm
            onSubmit={handleSubmit}
            isLoading={isGenerating}
            parameters={parameters}
            onParameterToggle={handleParameterToggle}
          />
        </div>

        {report && (
          <div className="space-y-6 sm:space-y-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-lg blur-lg opacity-30"></div>
                <Brain className="h-8 w-8 text-primary-600 relative" />
              </div>
              <h2 className="text-3xl font-bold text-neutral-800">
                Generated Business Case
              </h2>
              <div className="ml-auto flex gap-3">
                <button
                  onClick={handleDownloadPdf}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl
                    text-white bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                    shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </button>
                <button
                  onClick={handleDownloadHtml}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl
                  text-white bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                  shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download HTML
                </button>
              </div>
            </div>
            
            {reportSections.map(section => (
              <React.Fragment key={section.id}>
                {section.id === 'financialAnalysis' && (
                  formData && <GraphSection data={formData} />
                )}
                <ReportSection
                  title={section.title}
                  icon={section.icon}
                  response={report[section.id]}
                />
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;