// sw.js

// Import Workbox from CDN
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

if (workbox) {
  console.log(`Workbox is loaded`);

  // Ensure the new service worker activates immediately
  workbox.core.skipWaiting();
  workbox.core.clientsClaim();

  const { registerRoute } = workbox.routing;
  const { StaleWhileRevalidate, CacheFirst } = workbox.strategies;
  const { CacheableResponsePlugin } = workbox.cacheableResponse;
  const { ExpirationPlugin } = workbox.expiration;

  // Cache the Google Fonts stylesheets with a stale-while-revalidate strategy.
  registerRoute(
    ({url}) => url.origin === 'https://fonts.googleapis.com',
    new StaleWhileRevalidate({
      cacheName: 'google-fonts-stylesheets',
    })
  );

  // Cache the underlying font files with a cache-first strategy for 1 year.
  registerRoute(
    ({url}) => url.origin === 'https://fonts.gstatic.com',
    new CacheFirst({
      cacheName: 'google-fonts-webfonts',
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new ExpirationPlugin({
          maxAgeSeconds: 60 * 60 * 24 * 365,
          maxEntries: 30,
        }),
      ],
    })
  );

  // Cache CDN assets (react, genai, etc) with a cache-first strategy for stability
  registerRoute(
    ({url}) => url.origin === 'https://aistudiocdn.com' || url.origin === 'https://cdnjs.cloudflare.com',
    new CacheFirst({
      cacheName: 'cdn-assets',
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new ExpirationPlugin({
          maxAgeSeconds: 60 * 60 * 24 * 365, // Cache for a year
          maxEntries: 50,
        }),
      ],
    })
  );

  // Cache app shell (HTML, JS, manifest) using a Stale-While-Revalidate strategy.
  // This ensures the app loads quickly from cache while updating in the background.
  registerRoute(
    ({request}) => request.destination === 'document' ||
                   request.destination === 'script' ||
                   request.destination === 'style' ||
                   request.destination === 'manifest',
    new StaleWhileRevalidate({
      cacheName: 'app-shell-cache',
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    })
  );

  self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
  });

} else {
  console.log(`Workbox didn't load`);
}
