import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Keep a useful diagnostic in the browser console for deployment debugging.
    console.error('[EV Place] The app failed while rendering.', error, info?.componentStack || '');
  }

  render() {
    if (this.state.error) {
      const message = this.state.error instanceof Error
        ? this.state.error.message
        : String(this.state.error || 'Unknown rendering error');
      return (
        <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px', boxSizing: 'border-box', background: '#07130f', color: '#f2f7f4', fontFamily: 'Arial, sans-serif' }}>
          <section style={{ width: '100%', maxWidth: '560px', border: '1px solid #234333', borderRadius: '16px', padding: '28px', background: '#0d1c15', boxSizing: 'border-box' }}>
            <div style={{ color: '#27d879', fontSize: '12px', fontWeight: 700, letterSpacing: '2px' }}>EV PLACE</div>
            <h1 style={{ margin: '14px 0 8px', fontSize: '25px' }}>We hit a loading problem</h1>
            <p style={{ color: '#b7c9bd', lineHeight: 1.6, fontSize: '14px' }}>The page encountered an unexpected error. Your account and database settings have not been changed by this screen. Reload the page to try again.</p>
            <details style={{ margin: '18px 0', color: '#b7c9bd', fontSize: '12px' }}>
              <summary style={{ cursor: 'pointer', color: '#27d879' }}>Technical details</summary>
              <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontSize: '12px', lineHeight: 1.5 }}>{message}</pre>
            </details>
            <button onClick={() => window.location.reload()} style={{ border: 0, borderRadius: '8px', padding: '12px 18px', background: '#27d879', color: '#062114', fontWeight: 700, cursor: 'pointer' }}>Reload EV Place</button>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  document.body.innerHTML = '<main style="font-family:Arial,sans-serif;padding:32px;color:#f2f7f4;background:#07130f;min-height:100vh"><h1>EV Place could not start</h1><p>The page is missing its application root element. Please redeploy the latest GitHub commit.</p></main>';
} else {
  createRoot(rootElement).render(
    <React.StrictMode>
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    </React.StrictMode>
  );
}
