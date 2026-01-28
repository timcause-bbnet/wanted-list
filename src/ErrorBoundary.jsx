import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', color: 'white', backgroundColor: '#333', minHeight: '100vh' }}>
                    <h1>⚠️ 發生錯誤 (Application Error)</h1>
                    <p>抱歉，應用程式發生了非預期的錯誤。</p>
                    <button
                        onClick={() => {
                            localStorage.clear();
                            window.location.reload();
                        }}
                        style={{ padding: '10px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '20px' }}
                    >
                        🗑️ 清除快取並重整 (Clear Cache & Reload)
                    </button>

                    <details style={{ whiteSpace: 'pre-wrap', background: '#000', padding: '10px', borderRadius: '5px' }}>
                        <summary>錯誤詳細資訊 (Error Details)</summary>
                        <br />
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
