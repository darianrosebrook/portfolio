// Advanced Service Worker for Portfolio Site
// Provides intelligent caching, offline support, and performance optimization

const CACHE_NAME = 'portfolio-v2';
const STATIC_CACHE = 'portfolio-static-v2';
const DYNAMIC_CACHE = 'portfolio-dynamic-v2';
const API_CACHE = 'portfolio-api-v2';

// Critical files to cache immediately
const STATIC_FILES = [
  '/',
  '/offline',
  '/darianrosebrook-optimized.webp',
  '/darian-square.jpg',
  '/fonts/InterVariable.ttf',
  '/fonts/Nohemi-VF.ttf',
  '/logo.svg',
  '/favicon.ico',
];

// API endpoints to cache
const API_ENDPOINTS = ['/api/articles'];

// Cache strategies
const CACHE_STRATEGIES = {
  STATIC: 'cache-first',
  API: 'stale-while-revalidate',
  DYNAMIC: 'network-first',
};

// Install event - cache static files and preload critical resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(STATIC_FILES);
      }),
      caches.open(API_CACHE).then((cache) => {
        return cache.addAll(API_ENDPOINTS);
      }),
    ])
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== API_CACHE
            ) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim(), // Take control of all clients immediately
    ])
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
  } else if (request.destination === 'font') {
    event.respondWith(handleFontRequest(request));
  } else if (request.destination === 'document') {
    event.respondWith(handleDocumentRequest(request));
  } else {
    event.respondWith(handleOtherRequest(request));
  }
});

// Handle image requests with cache-first strategy
async function handleImageRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return a placeholder image if network fails
    return new Response(
      '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#f0f0f0"/><text x="200" y="150" text-anchor="middle" fill="#666">Image not available</text></svg>',
      {
        headers: { 'Content-Type': 'image/svg+xml' },
      }
    );
  }
}

// Handle font requests with cache-first strategy
async function handleFontRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('', { status: 404 });
  }
}

// Handle document requests with network-first strategy
async function handleDocumentRequest(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline');
    }

    return new Response('', { status: 404 });
  }
}

// Handle other requests with network-first strategy
async function handleOtherRequest(request) {
  // Skip caching for non-http(s) schemes (e.g., chrome-extension:, file:)
  try {
    const url = new URL(request.url);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return fetch(request);
    }
  } catch (_) {
    // If URL parsing fails, fall through to network-first handling
  }
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('', { status: 404 });
  }
}
