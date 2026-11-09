import React, { useState, useEffect } from 'react';

/**
 * Componente para instalación PWA en dispositivos móviles y de escritorio.
 */
const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // Si ya está ejecutándose como PWA instalada, no mostramos nada
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      console.log('[PWA] La app ya se está ejecutando en modo standalone (instalada).');
      return;
    }

    // Detectar iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome|crios|android/.test(userAgent);

    if (isIosDevice && isSafari) {
      setIsIOS(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      console.log('[PWA] Evento beforeinstallprompt capturado con éxito.');
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      console.log('[PWA] La aplicación fue instalada exitosamente.');
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) {
      alert(
        'Para instalar RENDIX en tu celular:\n\n' +
        '1. Toca los tres puntos (⋮) en la esquina superior del navegador.\n' +
        '2. Selecciona "Instalar aplicación" o "Agregar a la pantalla principal".'
      );
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[PWA] Respuesta del usuario:', outcome);

    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  // Mostrar botón si hay prompt nativo disponible o en iOS Safari
  if (!isInstallable && !isIOS) return null;

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="btn btn-outline-primary btn-sm btn-install-app"
        title="Instalar RENDIX en este dispositivo"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontWeight: '600'
        }}
      >
        📱 Instalar RENDIX
      </button>

      {/* Modal con instrucciones para iOS */}
      {showIOSModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowIOSModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              maxWidth: '360px',
              padding: '1.5rem',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              textAlign: 'center'
            }}
          >
            <h3 style={{ marginBottom: '0.75rem', fontSize: '1.1rem', color: '#0284c7' }}>
              📲 Instalar RENDIX en iPhone
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1rem', lineHeight: '1.4' }}>
              1. Pulsa el botón <strong>Compartir</strong> (icono de cuadrado con flecha hacia arriba ⎋ en la barra de Safari).<br /><br />
              2. Desplázate hacia abajo y selecciona <strong>"Añadir a la pantalla de inicio"</strong> (+).
            </p>
            <button
              onClick={() => setShowIOSModal(false)}
              className="btn btn-primary btn-sm btn-block"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallPrompt;
