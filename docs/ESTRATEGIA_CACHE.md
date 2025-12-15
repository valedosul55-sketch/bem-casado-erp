# Estratégia de Cache e Cache Busting

## Visão Geral

Este documento descreve a estratégia completa de cache implementada no projeto para garantir que os usuários sempre vejam a versão mais recente após um deploy, sem precisar limpar cache manualmente.

---

## 🎯 Objetivo

**Garantir que após cada deploy:**
- ✅ Usuários vejam automaticamente a nova versão
- ✅ Não precisem limpar cache manualmente
- ✅ Performance seja máxima (cache agressivo quando possível)
- ✅ Atualizações sejam instantâneas (sem cache quando necessário)

---

## 🔧 Implementação

### 1. Versionamento Automático de Assets (Vite)

**Arquivo:** `vite.config.ts` (linhas 26-37)

```typescript
build: {
  outDir: path.resolve(import.meta.dirname, "dist/public"),
  emptyOutDir: true,
  rollupOptions: {
    output: {
      // Cache-busting: adiciona hash em todos os arquivos
      entryFileNames: 'assets/[name].[hash].js',
      chunkFileNames: 'assets/[name].[hash].js',
      assetFileNames: 'assets/[name].[hash].[ext]',
    },
  },
},
```

**Como funciona:**
- Vite adiciona hash único baseado no conteúdo do arquivo
- Exemplo: `app.js` → `app.abc12345.js`
- Quando o código muda, o hash muda
- Navegador detecta nome diferente e baixa novo arquivo

**Arquivos afetados:**
- ✅ JavaScript (`.js`)
- ✅ CSS (`.css`)
- ✅ Imagens (`.png`, `.jpg`, `.svg`, etc.)
- ✅ Fontes (`.woff`, `.woff2`, `.ttf`, etc.)

---

### 2. Headers HTTP de Cache (Express)

**Arquivo:** `server/index.ts` (linhas 31-49)

#### 2.1. Arquivos com Hash (Cache Agressivo)

```typescript
if (filePath.match(/\.[a-f0-9]{8}\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/)) {
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
}
```

**Configuração:**
- `public` - Pode ser cacheado por CDNs e proxies
- `max-age=31536000` - Cache por 1 ano (31.536.000 segundos)
- `immutable` - Nunca revalidar (arquivo nunca muda)

**Justificativa:**
- Arquivos com hash no nome **nunca mudam**
- Se o conteúdo mudar, o hash muda → novo arquivo
- Cache agressivo = performance máxima

**Exemplo:**
```
app.abc12345.js → Cache por 1 ano
style.def67890.css → Cache por 1 ano
logo.ghi11121.png → Cache por 1 ano
```

#### 2.2. Arquivos HTML (Sem Cache)

```typescript
else if (filePath.endsWith('.html')) {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
}
```

**Configuração:**
- `no-cache` - Sempre revalidar com servidor
- `no-store` - Não armazenar em cache
- `must-revalidate` - Forçar revalidação
- `Pragma: no-cache` - Compatibilidade HTTP/1.0
- `Expires: 0` - Expiração imediata

**Justificativa:**
- HTML contém links para assets com hash
- Precisa ser sempre atualizado para apontar para novos assets
- Sem cache no HTML = usuário sempre vê versão mais recente

**Exemplo:**
```html
<!-- index.html (sem cache) -->
<script src="/assets/app.abc12345.js"></script>
```

Após deploy:
```html
<!-- index.html (nova versão, sem cache) -->
<script src="/assets/app.xyz67890.js"></script>
```

#### 2.3. Outros Arquivos (Cache Moderado)

```typescript
else {
  res.setHeader('Cache-Control', 'public, max-age=3600');
}
```

**Configuração:**
- `public` - Pode ser cacheado
- `max-age=3600` - Cache por 1 hora (3.600 segundos)

**Justificativa:**
- Arquivos sem hash podem mudar
- Cache moderado balanceia performance e atualização
- 1 hora é tempo razoável para maioria dos casos

---

## 🔄 Fluxo Completo

### Cenário: Deploy de Nova Versão

#### Antes do Deploy:
```
index.html (sem cache)
  ├─ app.abc12345.js (cache 1 ano)
  ├─ style.def67890.css (cache 1 ano)
  └─ logo.ghi11121.png (cache 1 ano)
```

#### Após Deploy:
```
index.html (sem cache, nova versão)
  ├─ app.xyz67890.js (cache 1 ano, arquivo novo!)
  ├─ style.uvw34567.css (cache 1 ano, arquivo novo!)
  └─ logo.rst89012.png (cache 1 ano, arquivo novo!)
```

#### O que acontece no navegador do usuário:

1. **Usuário acessa o site**
2. **Navegador busca `index.html`**
   - Sem cache → sempre baixa do servidor
3. **HTML aponta para novos assets**
   - `app.xyz67890.js` (nome diferente!)
4. **Navegador não tem esse arquivo em cache**
   - Baixa novo arquivo
5. **✅ Usuário vê nova versão automaticamente!**

---

## 📊 Tabela Resumo

| Tipo de Arquivo | Padrão | Cache-Control | Duração | Motivo |
|-----------------|--------|---------------|---------|--------|
| JS com hash | `app.[hash].js` | `public, max-age=31536000, immutable` | 1 ano | Nunca muda |
| CSS com hash | `style.[hash].css` | `public, max-age=31536000, immutable` | 1 ano | Nunca muda |
| Imagens com hash | `logo.[hash].png` | `public, max-age=31536000, immutable` | 1 ano | Nunca muda |
| HTML | `*.html` | `no-cache, no-store, must-revalidate` | 0 | Sempre atualizar |
| Outros | `*` | `public, max-age=3600` | 1 hora | Cache moderado |

---

## 🧪 Como Testar

### Teste 1: Verificar Hash nos Arquivos

1. Faça build de produção:
```bash
pnpm build
```

2. Verifique os arquivos gerados:
```bash
ls dist/public/assets/
```

3. Deve ver arquivos com hash:
```
app.abc12345.js
style.def67890.css
logo.ghi11121.png
```

### Teste 2: Verificar Headers HTTP

1. Acesse o site em produção
2. Abra DevTools (F12) → Network
3. Recarregue a página
4. Clique em um arquivo JS
5. Verifique headers:

**Para `app.[hash].js`:**
```
Cache-Control: public, max-age=31536000, immutable
```

**Para `index.html`:**
```
Cache-Control: no-cache, no-store, must-revalidate
Pragma: no-cache
Expires: 0
```

### Teste 3: Simular Deploy

1. Faça uma mudança no código
2. Faça deploy
3. Acesse o site (sem limpar cache)
4. ✅ Deve ver a nova versão automaticamente!

---

## ⚠️ Problemas Comuns e Soluções

### Problema: Usuário ainda vê versão antiga

**Possíveis causas:**

1. **Deploy não completou**
   - Aguarde Railway terminar o deploy
   - Verifique logs do Railway

2. **CDN/Proxy intermediário**
   - Se usar CDN (Cloudflare, etc.), pode ter cache adicional
   - Solução: Purge do cache da CDN após deploy

3. **Service Worker antigo**
   - Se tiver Service Worker, pode estar cacheando HTML
   - Solução: Atualizar lógica do Service Worker

4. **Cache do navegador muito agressivo**
   - Raro, mas alguns navegadores ignoram headers
   - Solução: Hard refresh (Ctrl+Shift+R)

### Problema: Performance ruim após deploy

**Possível causa:**
- Todos os usuários baixando novos assets ao mesmo tempo

**Soluções:**
1. Deploy gradual (canary deployment)
2. CDN para distribuir carga
3. HTTP/2 para paralelizar downloads

---

## 🔐 Segurança

### Headers de Segurança Adicionais (Recomendado)

Considere adicionar estes headers para melhorar segurança:

```typescript
// Prevenir MIME sniffing
res.setHeader('X-Content-Type-Options', 'nosniff');

// Prevenir clickjacking
res.setHeader('X-Frame-Options', 'DENY');

// XSS Protection
res.setHeader('X-XSS-Protection', '1; mode=block');
```

---

## 📚 Referências

- [MDN: HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [Vite: Build Options](https://vitejs.dev/config/build-options.html)
- [Google: Cache-Control Best Practices](https://web.dev/http-cache/)

---

## 📝 Changelog

| Data | Versão | Mudanças |
|------|--------|----------|
| 2025-12-13 | 1.0 | Documentação inicial da estratégia de cache |

---

## 👥 Contato

Para dúvidas ou sugestões sobre a estratégia de cache, contatar o time de desenvolvimento.

**Última atualização:** 2025-12-13
