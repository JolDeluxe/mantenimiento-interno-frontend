import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from '@/routes/AppRoutes';
import { ToastContainer } from '@/components/notification/toast-container';
import { processSyncQueue } from '@/stores/sync-store';

export const App = () => {

  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Volvió internet → sincronizando...');
      processSyncQueue();
    };

    window.addEventListener('online', handleOnline);

    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return (
    <BrowserRouter>
      <AppRoutes />
      <ToastContainer />
    </BrowserRouter>
  );
};

export default App;