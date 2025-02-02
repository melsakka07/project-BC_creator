import React from 'react';
import { Brain, Download } from 'lucide-react';
import InputForm from './components/InputForm';
import ReportSection from './components/ReportSection';
import GraphSection from './components/GraphSection';
import type { BusinessCase, BusinessCaseReport, BusinessCaseParameters } from './types';
import { ReportGenerator } from './services/reportGenerator';
import { PDFGenerator } from './services/pdfGenerator';
import { reportSections } from './config/reportSections';
import { AlertCircle } from 'lucide-react';
import { ErrorBoundary } from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import Header from './components/Header';

const reportGenerator = new ReportGenerator();
const pdfGenerator = new PDFGenerator();

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
  const [theme, setTheme] = React.useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  React.useEffect(() => {
    document.documentElement.classList.add(theme);
  }, []);

  const handleParameterToggle = (parameter: string | number | symbol) => {
    setParameters(prev => ({
      ...prev,
      [parameter]: !prev[parameter as keyof BusinessCaseParameters]
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
              <pre>${report[section.id as keyof BusinessCaseReport].content}</pre>
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

  const handleThemeToggle = React.useCallback(() => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(newTheme);
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 
        dark:from-neutral-900 dark:to-neutral-800 transition-colors duration-300">
        <Header theme={theme} onThemeToggle={handleThemeToggle} />
        
        <main className="relative">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-400/10 
              dark:bg-primary-400/5 rounded-full blur-3xl transform rotate-12 animate-float"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-400/10 
              dark:bg-secondary-400/5 rounded-full blur-3xl transform -rotate-12 animate-float 
              animation-delay-2000"></div>
          </div>

          {/* Main content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 
            space-y-8 sm:space-y-12">
            {apiError && (
              <div className="animate-slideIn">
                <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border 
                  border-red-100 dark:border-red-900/30 shadow-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <p className="ml-3 text-red-600 dark:text-red-400">{apiError}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="animate-fadeIn">
              <InputForm
                onSubmit={handleSubmit}
                isLoading={isGenerating}
                parameters={parameters}
                onParameterToggle={handleParameterToggle}
                theme={theme}
              />
            </div>

            {isGenerating && (
              <div className="fixed inset-0 bg-black/20 dark:bg-black/40 
                backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 
                  shadow-xl dark:shadow-neutral-900/50 max-w-sm w-full mx-4">
                  <div className="flex flex-col items-center text-center">
                    <LoadingSpinner size="lg" className="mb-4" />
                    <h3 className="text-lg font-medium text-neutral-900 
                      dark:text-neutral-100 mb-2">
                      Generating Business Case
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                      This may take a few moments...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {report && (
              <div className="space-y-6 sm:space-y-8 animate-fadeIn">
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
                      response={report[section.id as keyof BusinessCaseReport]}
                    />
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;