/* =========================================================
   COMPANIO - SERVICE WORKER
   Handles Web Push notifications and notification clicks.
========================================================= */

self.addEventListener("install", function (event) {
    // Activate worker immediately
    self.skipWaiting();
});

self.addEventListener("activate", function (event) {
    // Claim any currently active clients
    event.waitUntil(self.clients.claim());
});

self.addEventListener("push", function (event) {
    let payload = {};

    if (event.data) {
        try {
            payload = event.data.json();
        } catch (e) {
            payload = {
                title: "Companio 💜",
                body: event.data.text()
            };
        }
    } else {
        payload = {
            title: "Companio 💜",
            body: "A gentle reminder from Companio."
        };
    }

    const title = payload.title || "Companio 💜";
    const options = {
        body: payload.body || "A mindful moment is waiting for you.",
        icon: payload.icon || "/static/images/logo.png",
        badge: payload.badge || "/static/images/logo.png",
        tag: payload.tag || "companio-notification",
        renotify: true,
        data: payload.data || { url: "/dashboard" }
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener("notificationclick", function (event) {
    event.notification.close();

    const targetUrl = (event.notification.data && event.notification.data.url)
        ? event.notification.data.url
        : "/dashboard";

    const fullUrl = new URL(targetUrl, self.location.origin).href;

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
            // If any window from this origin is open, navigate and focus it
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url && client.url.startsWith(self.location.origin) && "focus" in client) {
                    if ("navigate" in client) {
                        client.navigate(fullUrl);
                    }
                    return client.focus();
                }
            }
            // Otherwise, open a new window
            if (clients.openWindow) {
                return clients.openWindow(fullUrl);
            }
        })
    );
});
