interface Env {
  BRAVE_API_KEY: string;
  BRAVE_API_ENDPOINT: string;
}

export const env: Env = {
  BRAVE_API_KEY: import.meta.env.VITE_BRAVE_API_KEY || '',
  BRAVE_API_ENDPOINT: import.meta.env.VITE_BRAVE_API_ENDPOINT || 'https://api.search.brave.com/res/v1/web/search'
}; 