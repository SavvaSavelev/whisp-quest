/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string; // например http://localhost:3001
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
