# Sistema de Cache Automático - Loja de Fábrica Bem Casado

## 📋 Visão Geral

Este documento descreve o sistema completo de gerenciamento de cache implementado na Loja de Fábrica Bem Casado, garantindo que os clientes sempre vejam a versão mais atualizada da aplicação sem precisar limpar cache manualmente.

## 🎯 Objetivos

1. **Atualizações Instantâneas**: Quando você publica uma nova versão, os clientes veem as mudanças automaticamente
2. **Performance Otimizada**: Assets estáticos são cacheados agressivamente para carregamento rápido
3. **Zero Intervenção Manual**: Não é necessário instruir clientes a limpar cache
4. **Experiência Transparente**: Atualizações acontecem de forma suave e automática

## 🔧 Componentes do Sistema

### 1. Cache-Busting no Vite

**Arquivo**: `vite.config.ts`

**Como funciona**:
- Todos os arquivos JS, CSS e imagens recebem um hash único no nome
- Exemplo: `main.a1b2c3d4.js`, `style.e5f6g7h8.css`
- Quando o código muda, o hash muda automaticamente
- Navegadores são forçados a baixar a nova versão

**Configuração**:
```typescript
build: {
  rollupOptions: {
    output: {
      entryFileNames: 'assets/[name].[hash].js',
      chunkFileNames: 'assets/[name].[hash].js',
      assetFileNames: 'assets/[name].[hash].[ext]',
    },
  },
}
```

### 2. Detecção Automática de Versão

**Arquivo**: `client/src/hooks/useAutoUpdate.ts`

**Como funciona**:
- Verifica a cada 5 minutos se há nova versão disponível
- Também verifica quando o usuário volta para a aba (visibilitychange)
- Compara o ETag ou Last-Modified do index.html
- Quando detecta mudança:
  1. Mostra notificação toast por 3 segundos
  2. Limpa todos os caches
  3. Recarrega a página automaticamente

**Uso**:
```typescript
// Já está ativo em App.tsx
useAutoUpdate();
```

### 3. Headers HTTP Otimizados

**Arquivo**: `server/index.ts`

**Estratégia de Cache**:

| Tipo de Arquivo | Cache-Control | Duração | Motivo |
|----------------|---------------|---------|---------|
| `index.html` | `no-cache, no-store, must-revalidate` | 0 | Sempre buscar versão mais recente |
| Assets com hash (`.a1b2c3d4.js`) | `public, max-age=31536000, immutable` | 1 ano | São imutáveis, podem ser cacheados indefinidamente |
| Outros arquivos | `public, max-age=3600` | 1 hora | Cache moderado |

**Implementação**:
```typescript
app.use(express.static(staticPath, {
  setHeaders: (res, filePath) => {
    if (filePath.match(/\.[a-f0-9]{8}\.(js|css|...)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
    else if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
    else {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
  },
}));
```

### 4. Service Worker Inteligente

**Arquivo**: `client/public/sw.js`

**Estratégias de Cache**:

1. **HTML (Network First)**:
   - Sempre busca da rede primeiro
   - Garante que usuário veja versão mais recente
   - Fallback para cache apenas se offline

2. **Assets com Hash (Cache First)**:
   - Busca do cache primeiro (são imutáveis)
   - Performance máxima
   - Cache de 1 ano

3. **Outros Recursos (Network First)**:
   - Busca da rede primeiro
   - Cacheia em background para uso offline
   - Fallback para cache se offline

**Versão Atual**: `bem-casado-v2`

## 🚀 Como Funciona na Prática

### Cenário 1: Você Publica uma Atualização

1. **Build**: Vite gera novos arquivos com novos hashes
   - Antes: `main.a1b2c3d4.js`
   - Depois: `main.x9y8z7w6.js`

2. **Deploy**: Novo `index.html` aponta para os novos arquivos

3. **Cliente Acessa**:
   - Service Worker busca `index.html` da rede (sempre)
   - Novo `index.html` referencia `main.x9y8z7w6.js`
   - Navegador baixa o novo arquivo (hash diferente)
   - Cliente vê a versão atualizada!

### Cenário 2: Detecção Automática

1. **Cliente está usando a loja**
2. **Você publica atualização**
3. **Após 5 minutos** (ou quando volta para aba):
   - Hook `useAutoUpdate` detecta mudança no ETag
   - Mostra toast: "Nova versão disponível! Atualizando em 3 segundos..."
   - Limpa caches
   - Recarrega página
4. **Cliente vê nova versão automaticamente**

### Cenário 3: Performance Otimizada

1. **Primeira visita**:
   - Baixa todos os assets
   - Service Worker cacheia assets com hash

2. **Visitas subsequentes**:
   - `index.html`: busca da rede (sempre atualizado)
   - Assets com hash: servidos do cache (instantâneo)
   - Carregamento super rápido!

## 📊 Benefícios

### Para Você (Administrador)

✅ **Zero Manutenção**: Não precisa instruir clientes a limpar cache
✅ **Atualizações Confiáveis**: Mudanças são visíveis imediatamente após deploy
✅ **Controle Total**: Pode publicar atualizações a qualquer momento
✅ **Rastreável**: Logs no console mostram quando nova versão é detectada

### Para os Clientes

✅ **Sempre Atualizado**: Veem a versão mais recente automaticamente
✅ **Performance Rápida**: Assets cacheados carregam instantaneamente
✅ **Experiência Suave**: Atualizações acontecem de forma transparente
✅ **Funciona Offline**: Fallback para cache quando sem internet

## 🔍 Monitoramento

### Console do Navegador

Abra o DevTools (F12) e veja os logs:

```
[SW] Instalando Service Worker v2...
[SW] Cache aberto
[SW] Ativando Service Worker v2...
Nova versão detectada! Atualizando...
```

### Network Tab

- `index.html`: Sempre mostra `200` (da rede)
- Assets com hash: Mostram `200 (from disk cache)` ou `200 (from service worker)`

## 🛠️ Manutenção

### Forçar Limpeza de Cache

Se precisar forçar limpeza de cache em todos os clientes:

1. **Incremente a versão do Service Worker**:
   ```javascript
   // Em client/public/sw.js
   const CACHE_NAME = 'bem-casado-v3'; // v2 → v3
   ```

2. **Publique a atualização**

3. **Service Worker antigo será substituído automaticamente**

### Desabilitar Temporariamente

Se precisar desabilitar o sistema temporariamente:

1. **Remova o hook do App.tsx**:
   ```typescript
   // Comente esta linha
   // useAutoUpdate();
   ```

2. **Publique a atualização**

## 📝 Notas Técnicas

### Compatibilidade

- ✅ Chrome/Edge: Suporte completo
- ✅ Firefox: Suporte completo
- ✅ Safari: Suporte completo
- ✅ Mobile (iOS/Android): Suporte completo

### Limitações

- Service Worker requer HTTPS (ou localhost)
- Primeira visita sempre baixa todos os assets
- Detecção de versão depende de conexão com internet

### Segurança

- Todos os caches são isolados por origem (CORS)
- Service Worker só funciona no mesmo domínio
- Headers HTTP seguem melhores práticas de segurança

## 🎓 Referências

- [MDN: HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [MDN: Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Vite: Build Options](https://vitejs.dev/config/build-options.html)
- [Web.dev: Cache-Control](https://web.dev/http-cache/)

---

**Última Atualização**: 24/11/2025  
**Versão do Sistema**: 2.0  
**Service Worker**: bem-casado-v2
