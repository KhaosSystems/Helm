import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function App() {
  return (
    <main className="p-6 text-text-primary">
      <h1 className="text-2xl">Matter</h1>
      <p className="mt-2 text-sm">Run Storybook with npm run storybook to browse components.</p>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
