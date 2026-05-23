import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props { children: ReactNode }
interface State { error: Error | null; info: ErrorInfo | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, info: null };

  static getDerivedStateFromError(error: Error) {
    return { error, info: null };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ info });
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '24px', fontFamily: 'sans-serif', background: '#fef7f0', minHeight: '100vh' }}>
          <h2 style={{ color: '#c00', marginBottom: 8 }}>应用出错了</h2>
          <p style={{ color: '#666', fontSize: 14, marginBottom: 16 }}>
            请截图发给管理员，错误信息如下：
          </p>
          <pre style={{
            background: '#fff0f0', border: '1px solid #fcc',
            padding: 12, borderRadius: 8, fontSize: 12,
            overflow: 'auto', maxHeight: '60vh', whiteSpace: 'pre-wrap',
            color: '#333'
          }}>
            {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack}
            {'\n\nComponent Stack:'}
            {this.state.info?.componentStack}
          </pre>
          <button onClick={() => { this.setState({ error: null, info: null }); window.location.reload(); }}
            style={{
              marginTop: 16, padding: '8px 24px', background: '#7c3aed',
              color: 'white', border: 'none', borderRadius: 8, fontSize: 14
            }}>
            重新加载
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
