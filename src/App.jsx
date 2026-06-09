import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from '@/routes/AppRoutes';
import { ToastContainer } from '@/components/notification/toast-container';
import { processOfflineQueue } from '@/lib/axios';

export const App = () => {

  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Volvió internet → sincronizando...');
      processOfflineQueue();
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