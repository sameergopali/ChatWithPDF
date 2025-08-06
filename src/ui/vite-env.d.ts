/// <reference types="vite/client" />
import 'react';

declare module 'react' {
  interface CSSProperties {
    // Add support for the custom property
    WebkitAppRegion?: string;
  }
}