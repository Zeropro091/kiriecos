import { lazy } from 'react';

// Lazy load heavy components and pages to ensure fast initial page load (under 1.5s)
export const LazyPage01Home = lazy(() => import('../pages/Page01Home').then(m => ({ ...[truncated]