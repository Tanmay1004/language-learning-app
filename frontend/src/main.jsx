import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { StyledEngineProvider } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import "react-toastify/dist/ReactToastify.css";

import App from './app/App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StyledEngineProvider injectFirst>
      <BrowserRouter>
          <App />
      </BrowserRouter>
    </StyledEngineProvider>
  </StrictMode>
);
