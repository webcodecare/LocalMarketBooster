import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface TrackingSettings {
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  googleAdsConversionId?: string;
  googleAdsConversionLabel?: string;
  metaPixelId?: string;
  tiktokPixelId?: string;
  snapPixelId?: string;
  trackingEnabled: boolean;
}

// Declare global variables for tracking
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    fbq?: {
      (event: 'init', pixelId: string): void;
      (event: 'track', eventName: string, parameters?: object): void;
      callMethod?: (...args: any[]) => void;
      queue?: any[];
      loaded?: boolean;
      version?: string;
      push?: (...args: any[]) => void;
    };
    ttq?: {
      (event: 'init', pixelId: string, config?: object): void;
      (event: 'track', eventName: string): void;
      page?: () => void;
      track?: (eventName: string) => void;
    };
    snaptr?: {
      (event: 'init', pixelId: string, config?: object): void;
      (event: 'track', eventName: string): void;
      handleRequest?: (...args: any[]) => void;
      queue?: any[];
    };
    _fbq?: any;
    TiktokAnalyticsObject?: string;
  }
}

export function TrackingScripts() {
  // Fetch tracking settings from backend
  const { data: settings } = useQuery<TrackingSettings>({
    queryKey: ['/api/tracking-settings'],
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false
  });

  useEffect(() => {
    if (!settings || !settings.trackingEnabled) {
      return;
    }

    // Load Google Analytics 4
    if (settings.googleAnalyticsId) {
      loadGoogleAnalytics(settings.googleAnalyticsId);
    }

    // Load Google Tag Manager
    if (settings.googleTagManagerId) {
      loadGoogleTagManager(settings.googleTagManagerId);
    }

    // Load Google Ads (only if GTM is not loaded to avoid conflicts)
    if (settings.googleAdsConversionId && !settings.googleTagManagerId) {
      loadGoogleAds(settings.googleAdsConversionId);
    }

    // Load Meta Pixel
    if (settings.metaPixelId) {
      loadMetaPixel(settings.metaPixelId);
    }

    // Load TikTok Pixel
    if (settings.tiktokPixelId) {
      loadTikTokPixel(settings.tiktokPixelId);
    }

    // Load Snap Pixel
    if (settings.snapPixelId) {
      loadSnapPixel(settings.snapPixelId);
    }

  }, [settings]);

  return null; // This component doesn't render anything
}

// Google Analytics 4 Integration
function loadGoogleAnalytics(measurementId: string) {
  if (window.gtag) return; // Already loaded

  // Add gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(...args: any[]) {
    window.dataLayer?.push(args);
  };
  
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: true
  });

  console.log('Google Analytics 4 loaded:', measurementId);
}

// Google Tag Manager Integration
function loadGoogleTagManager(containerId: string) {
  if (window.dataLayer) return; // Already loaded

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js'
  });

  // Add GTM script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${containerId}`;
  document.head.appendChild(script);

  // Add noscript fallback
  const noscript = document.createElement('noscript');
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.googletagmanager.com/ns.html?id=${containerId}`;
  iframe.height = '0';
  iframe.width = '0';
  iframe.style.display = 'none';
  iframe.style.visibility = 'hidden';
  noscript.appendChild(iframe);
  document.body.appendChild(noscript);

  console.log('Google Tag Manager loaded:', containerId);
}

// Google Ads Integration
function loadGoogleAds(conversionId: string) {
  if (window.gtag) return; // Already loaded via GA4 or GTM

  // Add gtag script for Google Ads
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${conversionId}`;
  document.head.appendChild(script);

  // Initialize gtag for Google Ads
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(...args: any[]) {
    window.dataLayer?.push(args);
  };
  
  window.gtag('js', new Date());
  window.gtag('config', conversionId);

  console.log('Google Ads loaded:', conversionId);
}

// Meta Pixel Integration
function loadMetaPixel(pixelId: string) {
  if (window.fbq) return; // Already loaded

  // Meta Pixel Code
  !(function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  // Check if fbq is available after loading
  if (window.fbq) {
    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
  }

  console.log('Meta Pixel loaded:', pixelId);
}

// TikTok Pixel Integration
function loadTikTokPixel(pixelId: string) {
  if (window.ttq) return; // Already loaded

  // TikTok Pixel Code
  !(function(w: any, d: any, t: any) {
    w.TiktokAnalyticsObject = t;
    var ttq = w[t] = w[t] || [];
    ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"];
    ttq.setAndDefer = function(t: any, e: any) {
      t[e] = function() {
        t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
      };
    };
    for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
    ttq.instance = function(t: any) {
      for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
      return e;
    };
    ttq.load = function(e: any, n: any) {
      var i = "https://analytics.tiktok.com/i18n/pixel/events.js";
      ttq._i = ttq._i || {};
      ttq._i[e] = [];
      ttq._i[e]._u = i;
      ttq._t = ttq._t || {};
      ttq._t[e] = +new Date();
      ttq._o = ttq._o || {};
      ttq._o[e] = n || {};
      var o = document.createElement("script");
      o.type = "text/javascript";
      o.async = !0;
      o.src = i + "?sdkid=" + e + "&lib=" + t;
      var a = document.getElementsByTagName("script")[0];
      a?.parentNode?.insertBefore(o, a);
    };
    ttq.load(pixelId);
    ttq.page();
  })(window, document, 'ttq');

  console.log('TikTok Pixel loaded:', pixelId);
}

// Snap Pixel Integration
function loadSnapPixel(pixelId: string) {
  if (window.snaptr) return; // Already loaded

  // Snap Pixel Code
  !(function(e: any, t: any, n: any) {
    if (e.snaptr) return;
    var a = e.snaptr = function() {
      a.handleRequest ? a.handleRequest.apply(a, arguments) : a.queue.push(arguments);
    };
    a.queue = [];
    var s = 'script';
    var r = t.createElement(s);
    r.async = !0;
    r.src = n;
    var u = t.getElementsByTagName(s)[0];
    u?.parentNode?.insertBefore(r, u);
  })(window, document, 'https://sc-static.net/scevent.min.js');

  window.snaptr('init', pixelId, {
    'user_email': '__INSERT_USER_EMAIL__'
  });
  window.snaptr('track', 'PAGE_VIEW');

  console.log('Snap Pixel loaded:', pixelId);
}

// Tracking event helpers for use throughout the app
export const trackEvent = {
  // User registration
  register: (userId?: string) => {
    try {
      if (window.gtag) {
        window.gtag('event', 'sign_up', {
          method: 'email',
          user_id: userId
        });
      }
      if (window.fbq) {
        window.fbq('track', 'CompleteRegistration');
      }
      if (window.ttq && window.ttq.track) {
        window.ttq.track('CompleteRegistration');
      }
      if (window.snaptr) {
        window.snaptr('track', 'SIGN_UP');
      }
    } catch (error) {
      console.warn('Error tracking registration event:', error);
    }
  },

  // Offer submission
  submitOffer: (offerId?: string) => {
    try {
      if (window.gtag) {
        window.gtag('event', 'submit_application', {
          item_id: offerId
        });
      }
      if (window.fbq) {
        window.fbq('track', 'SubmitApplication');
      }
      if (window.ttq && window.ttq.track) {
        window.ttq.track('SubmitForm');
      }
      if (window.snaptr) {
        window.snaptr('track', 'COMPLETE_TUTORIAL');
      }
    } catch (error) {
      console.warn('Error tracking offer submission event:', error);
    }
  },

  // Contact action (phone, email, etc.)
  contact: (method: 'phone' | 'email' | 'whatsapp') => {
    try {
      if (window.gtag) {
        window.gtag('event', 'contact', {
          method: method
        });
      }
      if (window.fbq) {
        window.fbq('track', 'Contact');
      }
      if (window.ttq && window.ttq.track) {
        window.ttq.track('Contact');
      }
      if (window.snaptr) {
        window.snaptr('track', 'START_TRIAL');
      }
    } catch (error) {
      console.warn('Error tracking contact event:', error);
    }
  },

  // Lead generation (like button)
  generateLead: (offerId?: string) => {
    try {
      if (window.gtag) {
        window.gtag('event', 'generate_lead', {
          item_id: offerId
        });
      }
      if (window.fbq) {
        window.fbq('track', 'Lead');
      }
      if (window.ttq && window.ttq.track) {
        window.ttq.track('GenerateLead');
      }
      if (window.snaptr) {
        window.snaptr('track', 'SUBSCRIBE');
      }
    } catch (error) {
      console.warn('Error tracking lead generation event:', error);
    }
  },

  // Page view (for single page app navigation)
  pageView: (pagePath: string) => {
    try {
      if (window.gtag) {
        window.gtag('config', 'GA_MEASUREMENT_ID', {
          page_path: pagePath
        });
      }
      if (window.fbq) {
        window.fbq('track', 'PageView');
      }
      if (window.ttq && window.ttq.page) {
        window.ttq.page();
      }
      if (window.snaptr) {
        window.snaptr('track', 'PAGE_VIEW');
      }
    } catch (error) {
      console.warn('Error tracking page view event:', error);
    }
  }
};