import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from '@/routes/AppRoutes';

// AQUI ESTÁ EL IMPORT QUE FALTA PARA QUE NO DE ERROR
import { ToastContainer } from '@/components/notification/toast-container';

export const App = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
      <ToastContainer />
    </BrowserRouter>
  );
};

export default App;