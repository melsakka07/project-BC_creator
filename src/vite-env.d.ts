/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BRAVE_API_KEY: string
  readonly VITE_BRAVE_API_ENDPOINT: string
  readonly VITE_OPENAI_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}