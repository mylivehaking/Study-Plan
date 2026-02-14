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

  function showBanner() {
    if (!banner) return;
    banner.hidden = false;
  }

  function hideBanner() {
    if (!banner) return;
    banner.hidden = true;
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
  const isInStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
  if (isIos && !isInStandalone && banner && installBtn) {
    banner.querySelector('.install-banner__text').textContent = 'برای نصب: Share → Add to Home Screen';
    installBtn.hidden = true;
    showBanner();
  }
})();
