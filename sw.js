// sw.js — Service Worker da plataforma Professores de IA
// Responsável por receber notificações push mesmo com o site fechado,
// e por abrir/focar o professor certo quando a aluna toca na notificação.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let dados = { titulo: 'Seu professor', corpo: 'Você tem um lembrete agora.', tipo: '' };
  try {
    if (event.data) {
      dados = { ...dados, ...event.data.json() };
    }
  } catch (e) {
    // payload não veio em JSON — usa os valores padrão
  }

  const opcoes = {
    body: dados.corpo,
    icon: '/favicon-32.png',
    badge: '/favicon-32.png',
    vibrate: [300, 150, 300, 150, 300],
    tag: dados.tipo || 'lembrete-geral',
    renotify: true,
    requireInteraction: true, // fica na tela até a aluna tocar (não some sozinha)
    data: { url: self.location.origin }
  };

  event.waitUntil(self.registration.showNotification(dados.titulo, opcoes));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlAlvo = event.notification.data?.url || self.location.origin;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((janelas) => {
      for (const janela of janelas) {
        if (janela.url.startsWith(urlAlvo) && 'focus' in janela) {
          return janela.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlAlvo);
      }
    })
  );
});
