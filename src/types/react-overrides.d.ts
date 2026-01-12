// This file provides explicit type overrides for React hooks and types
// to resolve import issues in the project

declare module 'react' {
  export * from 'react';
  
  // Explicitly export common hooks to ensure TypeScript recognizes them
  export { 
    useState,
    useEffect,
    useLayoutEffect,
    useContext,
    useReducer,
    useCallback,
    useMemo,
    useRef,
    useImperativeHandle,
    useDebugValue,
    useTransition,
    useDeferredValue,
    useId,
    useSyncExternalStore,
    useInsertionEffect
  } from 'react';

  // Export common types
  export type {
    ReactNode,
    ReactElement,
    Component,
    ComponentType,
    FC,
    FunctionComponent,
    PropsWithChildren,
    ReactPortal,
    ErrorInfo
  } from 'react';
}

// Global React namespace to ensure proper recognition
declare global {
  export interface Window {
    React?: typeof import('react');
  }
}