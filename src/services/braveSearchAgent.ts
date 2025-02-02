import type { BusinessCase } from '../types';

interface SearchResult {
  title: string;
  description: string;
  url: string;
}

interface BraveSearchResponse {
  web: {
    results: SearchResult[];
    total: number;
  };
}

export class BraveSearchAgent {
  private apiKey: string;
  private apiEndpoint: string;
  private isConfigured: boolean;

  constructor() {
    this.apiKey = import.meta.env.VITE_BRAVE_API_KEY;
    this.apiEndpoint = import.meta.env.VITE_BRAVE_API_ENDPOINT;
    this.isConfigured = this.validateConfiguration();
    
    if (!this.isConfigured) {
      console.warn('Brave Search API is not properly configured. Please check your .env file.');
    }
  }

  private validateConfiguration(): boolean {
    if (!this.apiKey || !this.apiEndpoint) {
      console.error('Brave Search API configuration is missing. Please check your .env file.');
      return false;
    }

    if (this.apiKey === 'your_brave_api_key_here') {
      console.error('Please replace the placeholder with your actual Brave Search API key in the .env file.');
      return false;
    }

    return true;
  }

  private async searchBrave(query: string): Promise<SearchResult[]> {
    try {
      if (!this.isConfigured) {
        throw new Error('Brave Search API is not configured. Please check your .env file configuration.');
        return [];
      }

      const encodedQuery = encodeURIComponent(query);
      const proxyEndpoint = '/api/brave-search';

      const params = new URLSearchParams({
        q: encodedQuery,
        count: '3',
        search_lang: 'en',
        safesearch: 'moderate',
        freshness: 'past_month',
        text_format: 'plain'
      });

      const response = await fetch(`${proxyEndpoint}?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Subscription-Token': this.apiKey,
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
      });

      if (response.status === 401) {
        console.error('Authentication failed - invalid API key');
        throw new Error('Invalid API key');
        return [];
      }

      if (response.status === 429) {
        console.error('Rate limit exceeded');
        throw new Error('Rate limit exceeded - please try again later');
        return [];
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Brave API Response:', {
          status: response.status || 'unknown',
          statusText: response.statusText || 'No status text',
          error: errorText || 'No error text'
        });
        throw new Error(`API request failed (${response.status}): ${response.statusText}`);
      }

      const data: BraveSearchResponse = await response.json();
      
      if (!data || !data.web || !Array.isArray(data.web.results)) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format from Brave Search API');
      }

      return data.web.results;

    } catch (error) {
      if (error instanceof Error) {
        console.error('Brave search error:', {
          message: error.message,
          apiConfigured: this.isConfigured,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error; // Re-throw to handle in the calling code
      }
      return [];
    }
  }

  private generateSearchQueries(data: BusinessCase): string[] {
    const currentYear = new Date().getFullYear();
    return [
      `"${data.industry}" market size revenue "${data.country}" ${currentYear}`,
      `"${data.industry}" industry trends "${data.country}" ${currentYear}`,
      `"${data.industry}" market growth forecast "${data.country}"`,
      `"${data.industry}" competitive analysis "${data.country}"`,
      `"${data.industry}" industry outlook "${data.country}" ${currentYear}`
    ];
  }

  private async searchWithRetry(query: string, retries = 2): Promise<SearchResult[]> {
    for (let i = 0; i <= retries; i++) {
      try {
        const results = await this.searchBrave(query);
        if (results.length > 0) {
          return results;
        }
        if (i < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      } catch (error) {
        if (i === retries) {
          console.error('All retry attempts failed:', error);
          return [];
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    return [];
  }

  private async searchAllQueries(queries: string[]): Promise<SearchResult[]> {
    const results = [];
    // Sequential requests to avoid rate limiting
    for (const query of queries) {
      try {
        const queryResults = await this.searchWithRetry(query);
        results.push(...queryResults);
        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.warn(`Query failed: ${query}`, error);
        continue;
      }
    }
    
    return results;
  }

  private deduplicateResults(results: SearchResult[]): SearchResult[] {
    const seen = new Set<string>();
    return results.filter(result => {
      const normalizedUrl = result.url.replace(/^https?:\/\/(www\.)?/, '');
      if (seen.has(normalizedUrl)) return false;
      seen.add(normalizedUrl);
      return true;
    });
  }

  private formatResults(results: SearchResult[]): string {
    if (results.length === 0) {
      return this.getFallbackInsights();
    }

    const sections = [
      {
        title: 'Real-Time Market Insights',
        results: results.filter(r => 
          r.title.toLowerCase().includes('market') || 
          r.title.toLowerCase().includes('industry'))
      },
      {
        title: 'Latest Industry Trends',
        results: results.filter(r => 
          r.title.toLowerCase().includes('growth') || 
          r.title.toLowerCase().includes('trend'))
      },
      {
        title: 'Market Analysis & Competition',
        results: results.filter(r => 
          r.title.toLowerCase().includes('compet') || 
          r.description.toLowerCase().includes('market share'))
      }
    ];

    return sections
      .map(section => {
        const sectionResults = section.results.length > 0 ? 
          section.results : results;
        
        return `<div class="bg-white/50 rounded-xl p-6 backdrop-blur-sm mb-6">
  <h4 class="text-lg font-semibold text-neutral-800 mb-4">${section.title}</h4>
  ${sectionResults.slice(0, 2).map(result => 
    `<div class="mb-4 last:mb-0">
      <p class="text-neutral-700 mb-2">${result.description.trim()}</p>
      <a href="${result.url}" 
         target="_blank" 
         rel="noopener noreferrer" 
         class="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors group">
        <span class="underline">${result.title}</span>
        <svg class="w-4 h-4 ml-1 transform transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
      </a>
    </div>`
  ).join('\n')}
</div>`;
      })
      .join('\n\n');
  }

  private getFallbackInsights(): string {
    return `<div class="space-y-6">
  <div class="bg-white/50 rounded-xl p-6 backdrop-blur-sm">
    <div class="p-4 bg-amber-50 rounded-lg mb-6 text-sm text-amber-800">
      Note: Using simulated market research data as real-time market data is currently unavailable.
    </div>

    <h4 class="text-lg font-semibold text-neutral-800 mb-4">Market Overview</h4>
    <p class="text-neutral-700 mb-1">The industry continues to show strong growth potential with increasing demand for innovative solutions.</p>
    <p class="text-sm text-neutral-500">Source: Internal Market Analysis</p>
  </div>

  <div class="bg-white/50 rounded-xl p-6 backdrop-blur-sm">
    <h4 class="text-lg font-semibold text-neutral-800 mb-4">Digital Transformation Trends</h4>
    <p class="text-neutral-700 mb-1">Companies are increasingly adopting digital solutions to improve efficiency and competitiveness.</p>
    <p class="text-sm text-neutral-500">Source: Industry Reports</p>
  </div>

  <div class="bg-white/50 rounded-xl p-6 backdrop-blur-sm">
    <h4 class="text-lg font-semibold text-neutral-800 mb-4">Growth Opportunities</h4>
    <p class="text-neutral-700 mb-1">Emerging markets present significant expansion opportunities with rising demand.</p>
    <p class="text-sm text-neutral-500">Source: Market Research</p>
  </div>

  <div class="bg-white/50 rounded-xl p-6 backdrop-blur-sm">
    <h4 class="text-lg font-semibold text-neutral-800 mb-4">Competitive Landscape</h4>
    <p class="text-neutral-700 mb-1">The market remains dynamic with both established players and innovative startups.</p>
    <p class="text-sm text-neutral-500">Source: Industry Analysis</p>
  </div>

  <div class="bg-white/50 rounded-xl p-6 backdrop-blur-sm">
    <h4 class="text-lg font-semibold text-neutral-800 mb-4">Future Outlook</h4>
    <p class="text-neutral-700 mb-1">Positive growth trajectory expected with technological advancements driving adoption.</p>
    <p class="text-sm text-neutral-500">Source: Market Forecast</p>
  </div>
</div>`;
  }

  async searchMarketInsights(data: BusinessCase): Promise<string> {
    try {
      const queries = this.generateSearchQueries(data);
      
      if (!this.isConfigured) {
        return this.getFallbackInsights();
      }

      const results = await this.searchAllQueries(queries);
      return this.summarizeResults(results);
    } catch (error) {
      console.error('Error in market insights:', error);
      return this.getFallbackInsights();
    }
  }

  private summarizeResults(results: SearchResult[]): string {
    if (results.length === 0) {
      return this.getFallbackInsights();
    }

    const uniqueResults = this.deduplicateResults(results);
    return this.formatResults(uniqueResults);
  }
}