import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { DataProvider } from './data/DataProvider';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <DataProvider>
        <App />
      </DataProvider>
    </HashRouter>
  </React.StrictMode>
);
