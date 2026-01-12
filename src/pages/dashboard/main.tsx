import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from '@/shared/components/ui/provider';
import '@/index.css';
import DashboardApp from './DashboardApp';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider>
      <DashboardApp />
    </Provider>
  </StrictMode>,
);
