self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data?.json() ?? {}; } catch { data = { title: "Diamy Admin", body: event.data?.text() }; }

  event.waitUntil(
    self.registration.showNotification(data.title ?? "Diamy Admin", {
      body: data.body ?? "",
      icon: "/logo.png",
      badge: "/logo.png",
      tag: "diamy-order",
      renotify: true,
      data: { url: data.url ?? "/admin/pedidos" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/admin/pedidos";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes("/admin") && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
