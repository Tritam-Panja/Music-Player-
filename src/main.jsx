import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App Crash caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', color: '#fff', background: '#090a10', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          <h1 style={{ color: '#f43f5e', fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
            Application Error
          </h1>
          <p style={{ color: '#cbd5e1', marginBottom: '16px' }}>{this.state.error?.toString()}</p>
          <pre style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', overflow: 'auto', fontSize: '12px', color: '#94a3b8' }}>
            {this.state.error?.stack}
          </pre>
          <button 
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{ marginTop: '20px', padding: '10px 20px', background: '#38bdf8', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Reset Local Storage & Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);

