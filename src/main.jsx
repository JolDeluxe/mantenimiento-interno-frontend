import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Apunta a la raíz, tal como Vite lo servirá desde la carpeta public
    navigator.serviceWorker.register('/sw.js')
      .then(registration => console.log('SW Registrado con éxito:', registration.scope))
      .catch(error => console.error('Error al registrar SW:', error));
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);