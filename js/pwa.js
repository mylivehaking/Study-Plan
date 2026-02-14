(function () {
  if (!('serviceWorker' in navigator)) return;

  let deferredPrompt = null;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // ignore
    });
  });

  const banner = document.getElementById('install-banner');
  const installBtn = document.getElementById('install-btn');

  const isStandalone = () => {
    // iOS
    if ('standalone' in navigator && navigator.standalone) return true;
    // Modern browsers
    return !!(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
  };

  function showBanner() {
    if (!banner) return;
    banner.hidden = false;
  }

  function hideBanner() {
    if (!banner) return;
    banner.hidden = true;
  }

  // اگر اپ نصب شده و در حالت standalone اجرا شده، بنر نصب را نشان نده
  if (isStandalone()) {
    hideBanner();
    return;
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showBanner();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    hideBanner();
  });

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      try {
        await deferredPrompt.userChoice;
      } finally {
        deferredPrompt = null;
        hideBanner();
      }
    });
  }

  // iOS Safari: beforeinstallprompt وجود ندارد
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (isIos && !isStandalone() && banner && installBtn) {
    banner.querySelector('.install-banner__text').textContent = 'برای نصب: Share → Add to Home Screen';
    installBtn.hidden = true;
    showBanner();
  }
})();
