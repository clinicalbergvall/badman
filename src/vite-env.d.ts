/// <reference types="vite/client" />

// Extend ImportMeta to include env
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly PROD: boolean;
  readonly DEV: boolean;
  readonly SSR: boolean;
  readonly VITE_API_URL?: string;
}

// Declare CSS modules if you're using them
declare module '*.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// Declare side-effect imports
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// For side-effect imports like CSS files
declare module '*.css' {
  const content: any;
  export default content;
}