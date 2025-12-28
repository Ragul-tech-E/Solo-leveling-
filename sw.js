const CACHE_NAME = 'sl-system-cache-v7';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Hourly background pulse logic
let lastNotifiedHour = -1;

/**
 * Background heartbeat. 
 * Note: Browsers may throttle this when the tab is inactive, 
 * but it will trigger whenever the system wakes up the worker.
 */
setInterval(() => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Pulse exactly on the hour
  if (currentMinute === 0 && lastNotifiedHour !== currentHour) {
    lastNotifiedHour = currentHour;
    
    self.registration.showNotification("THE SYSTEM", {
      body: "System Sync: Daily Quest status evaluation in progress...",
      icon: '/icon.png',
      tag: 'hourly-sync',
      renotify: true,
      vibrate: [300, 100, 300]
    });
  }
}, 30000);

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});