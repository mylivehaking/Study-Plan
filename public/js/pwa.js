(function () {
  if (!('serviceWorker' in navigator)) return;

  let deferredPrompt = null;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // ignore
    });
  });

  const installOverlay = document.getElementById('install-overlay');
  const installBtn = document.getElementById('install-btn');
  const iosInfo = document.getElementById('ios-info');
  const closeBtn = document.getElementById('close-install');

  const isStandalone = () => {
    if ('standalone' in navigator && navigator.standalone) return true;
    return !!(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
  };

  // اگر نصب شده است، کلاً نمایش نده
  if (isStandalone()) {
    if (installOverlay) installOverlay.style.display = 'none';
    return;
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // نمایش اورلی فقط اگر قبلاً در این سشن بسته نشده باشد
    if (installOverlay && sessionStorage.getItem('install_dismissed') !== 'true') {
      installOverlay.style.display = 'flex';
    }
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    if (installOverlay) installOverlay.style.display = 'none';
  });

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        deferredPrompt = null;
        if (installOverlay) installOverlay.style.display = 'none';
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (installOverlay) installOverlay.style.display = 'none';
      sessionStorage.setItem('install_dismissed', 'true');
    });
  }

  // iOS Safari
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (isIos && !isStandalone() && iosInfo) {
    if (installOverlay && sessionStorage.getItem('install_dismissed') !== 'true') {
        installOverlay.style.display = 'flex';
        iosInfo.style.display = 'block';
        if (installBtn) installBtn.style.display = 'none';
    }
  }
})();
