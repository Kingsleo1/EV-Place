import { useEffect, useState } from 'react';
import { Download, X, Share } from 'lucide-react';
import './pwa-install.css';

const DISMISSED_KEY = 'ev-place-pwa-prompt-dismissed';
const INSTALLED_KEY = 'ev-place-pwa-installed';
const SEEN_KEY = 'ev-place-pwa-prompt-seen';

function isStandalone() {
  return window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
}

function isAppleMobile() {
  return /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export default function PWAInstallPrompt() {
  const [installEvent, setInstallEvent] = useState(null);
  const [visible, setVisible] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      const isMobile = window.matchMedia?.('(max-width: 760px)').matches ?? true;
      const installed = isStandalone() || localStorage.getItem(INSTALLED_KEY) === 'yes';
      const dismissed = localStorage.getItem(DISMISSED_KEY) === 'yes';
      const alreadyShown = localStorage.getItem(SEEN_KEY) === 'yes';
      const shouldShow = isMobile && !installed && !dismissed && !alreadyShown && (isAppleMobile() || Boolean(installEvent));
      if (shouldShow) localStorage.setItem(SEEN_KEY, 'yes');
      setIos(isAppleMobile());
      setVisible(shouldShow);
    };

    const onBeforeInstall = event => {
      event.preventDefault();
      setInstallEvent(event);
    };
    const onInstalled = () => {
      localStorage.setItem(INSTALLED_KEY, 'yes');
      setInstallEvent(null);
      setVisible(false);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    window.addEventListener('resize', updateVisibility);
    updateVisibility();

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
      window.removeEventListener('resize', updateVisibility);
    };
  }, [installEvent]);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'yes');
    setVisible(false);
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice?.outcome === 'accepted') {
      // The app is marked installed only after the browser confirms appinstalled.
      setInstallEvent(null);
    }
  };

  if (!visible) return null;

  return (
    <aside className="pwa-install-prompt" role="region" aria-label="Install EV Place">
      <div className="pwa-install-mark"><Download size={18} /></div>
      <div className="pwa-install-copy">
        <strong>Take EV Place with you</strong>
        <span>{ios ? 'Tap Share, then “Add to Home Screen”.' : 'Add the EV Place app to your home screen.'}</span>
        {ios && <small><Share size={12} /> Use the Share button in Safari.</small>}
      </div>
      {!ios && <button className="pwa-install-action" type="button" onClick={install}>Install</button>}
      <button className="pwa-install-dismiss" type="button" onClick={dismiss} aria-label="Dismiss install suggestion"><X size={16} /></button>
    </aside>
  );
}
