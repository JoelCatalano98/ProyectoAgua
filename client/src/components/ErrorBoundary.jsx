import React from 'react';

/**
 * Componente ErrorBoundary para capturar errores no controlados en el árbol de render de React.
 * Muestra una pantalla de contingencia amigable evitando la pantalla en blanco.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Capturado error de render:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            backgroundColor: 'var(--bg-body, #f8fafc)'
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '520px',
              width: '100%',
              textAlign: 'center',
              padding: '2.5rem 2rem',
              boxShadow: 'var(--shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1))'
            }}
          >
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main, #1e293b)', marginBottom: '0.5rem' }}>
              Algo salió mal
            </h2>
            <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Ocurrió un error inesperado al renderizar la interfaz. Podés intentar recargar la página o regresar al inicio del sistema.
            </p>

            {this.state.error?.message && (
              <div
                className="alert alert-danger"
                style={{
                  textAlign: 'left',
                  fontSize: '0.85rem',
                  marginBottom: '1.5rem',
                  wordBreak: 'break-word'
                }}
              >
                <span>⚠️</span>
                <div>{this.state.error.message}</div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={this.handleReload}>
                🔄 Recargar aplicación
              </button>
              <button className="btn btn-secondary" onClick={this.handleGoHome}>
                🏠 Volver al inicio
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
