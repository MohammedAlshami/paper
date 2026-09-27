import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/app.css';

if (import.meta.env.DEV) {
  // Dev-only component inspector: hover any element to see the file it comes from.
  void import('react-grab');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
