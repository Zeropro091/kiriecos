import { lazy } from 'react';

// Lazy load helper module if needed in future router splits
export const LazyPage01Home = lazy(() => import('../pages/Page01Home').then(m => ({ default: m.Page01Home })));
