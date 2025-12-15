/**
 * Service Worker para controle inteligente de cache
 * Garante que a aplicação sempre use a versão mais recente
 */

const CACHE_NAME = 'bem-casado-v2'; // Incrementar versão para forçar atualização
const RUNTIME_CACHE = 'bem-casado-runtime';

// Arquivos essenciais para cachear (apenas assets estáticos imutáveis)
const STATIC_ASSETS = [
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Instalação: cachear assets estáticos
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker v2...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Cache aberto');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  
  // Ativar imediatamente sem esperar
  self.skipWaiting();
});

// Ativação: limpar caches antigos
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando Service Worker v2...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[SW] Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Assumir controle de todas as páginas imediatamente
  return self.clients.claim();
});

// Fetch: estratégia Network First para HTML, Cache First para assets com hash
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requisições de outros domínios
  if (url.origin !== location.origin) {
    return;
  }
  
  // Para HTML e rotas da aplicação: SEMPRE buscar da rede (Network First)
  // Isso garante que o usuário sempre veja a versão mais recente
  if (request.headers.get('accept')?.includes('text/html') || request.mode === 'navigate') {
    event.respondWith(
      fetch(request, {
        cache: 'no-cache' // Força bypass de cache do navegador
      })
        .then((response) => {
          // NÃO cachear HTML - sempre buscar do servidor
          return response;
        })
        .catch(() => {
          // Se offline, tentar servir do cache como fallback
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || new Response('Offline', { status: 503 });
          });
        })
    );
    return;
  }
  
  // Para assets com hash no nome: Cache First (são imutáveis)
  // Exemplo: main.a1b2c3d4.js, style.e5f6g7h8.css
  if (request.url.match(/\.[a-f0-9]{8}\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request).then((response) => {
          // Cachear para uso futuro (cache de 1 ano - são imutáveis)
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          
          return response;
        });
      })
    );
    return;
  }
  
  // Para outros recursos (API, imagens sem hash, etc): Network First
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cachear em background para uso offline
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback para cache se offline
        return caches.match(request);
      })
  );
});

// Mensagens: permitir limpeza de cache sob demanda
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('[SW] Limpando todos os caches...');
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }).then(() => {
        // Notificar cliente que cache foi limpo
        event.ports[0].postMessage({ success: true });
      })
    );
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
