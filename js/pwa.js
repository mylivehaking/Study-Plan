(function () {
  if (!('serviceWorker' in navigator)) return;

  let deferredPrompt = null;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // ignore
    });
  });

  const installBtn = document.getElementById('install-btn');
  const iosInfo = document.getElementById('ios-info');

  const isStandalone = () => {
    // iOS
    if ('standalone' in navigator && navigator.standalone) return true;
    // Modern browsers
    return !!(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
  };

  // اگر اپ نصب شده است، ریدایرکت به ایندکس
  if (isStandalone() && window.location.pathname.includes('install.html')) {
    window.location.href = 'index.html';
    return;
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.style.display = 'block';
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    window.location.href = 'index.html';
  });

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        deferredPrompt = null;
      }
    });
  }

  // iOS Safari
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (isIos && !isStandalone() && iosInfo) {
    iosInfo.style.display = 'block';
    if (installBtn) installBtn.style.display = 'none';
  }
})();
