# Guia de Deploy em Produção - Loja Bem Casado

Este documento contém o passo a passo completo para implantar a **Loja Bem Casado** no domínio **www.arrozbemcasado.com.br** em um ambiente de produção permanente.

---

## ✅ Status Atual do Projeto

O projeto foi testado e está **pronto para deploy em produção**. O build foi executado com sucesso e gerou os seguintes arquivos:

- **Frontend otimizado:** `dist/public/` (1.4 MB comprimido)
- **Backend compilado:** `dist/index.js` (98 KB)
- **Assets estáticos:** Imagens, fontes e ícones copiados

### Avisos do Build (não críticos)

Durante o build, alguns avisos foram gerados:

1. **Variáveis de ambiente não definidas:** `%VITE_APP_LOGO%`, `%VITE_APP_TITLE%`, `%VITE_ANALYTICS_ENDPOINT%`, `%VITE_ANALYTICS_WEBSITE_ID%`
   - **Impacto:** Essas variáveis são opcionais e usadas para personalização e analytics.
   - **Ação:** Você pode defini-las no `.env` se quiser personalizar o título da página e adicionar analytics.

2. **Chunk grande (1.1 MB):**
   - **Impacto:** O arquivo JavaScript principal é grande, mas isso é normal para aplicações React complexas.
   - **Ação:** Futuramente, pode-se otimizar com code-splitting, mas não é crítico agora.

---

## 🎯 Objetivo Final

Implantar a loja em **www.arrozbemcasado.com.br** com:

- ✅ Disponibilidade 24/7
- ✅ HTTPS (certificado SSL)
- ✅ Banco de dados MySQL em nuvem
- ✅ Todas as integrações funcionando (SafraPay, Focus NFe, Mailchimp, WhatsApp)
- ✅ Backups automáticos

---

## 📋 Pré-requisitos

Antes de começar o deploy, você precisa ter:

### 1. Domínio Configurado
- ✅ **Domínio:** www.arrozbemcasado.com.br (você já tem)
- ⚠️ **Acesso ao DNS:** Você precisa ter acesso ao painel de controle do domínio para configurar os registros DNS

### 2. Servidor de Hospedagem
Escolha uma das opções abaixo (recomendo Railway ou Vercel):

| Plataforma | Custo Mensal | Complexidade | Recomendado Para |
|------------|--------------|--------------|------------------|
| **Railway** | R$ 50-100 | Baixa | Full-stack com banco incluído |
| **Vercel + PlanetScale** | R$ 0-50 | Média | Performance máxima |
| **DigitalOcean** | R$ 25-150 | Média | Controle total |
| **AWS/Google Cloud** | R$ 100-300 | Alta | Escalabilidade máxima |

### 3. Banco de Dados MySQL em Nuvem
Opções:

- **PlanetScale:** Grátis até 5GB (compatível com MySQL)
- **Railway MySQL:** Incluído no plano (~$5/mês)
- **AWS RDS:** A partir de $15/mês
- **DigitalOcean Managed Database:** A partir de $15/mês

### 4. Credenciais de Integração
Você precisa ter em mãos:

- ✅ Token da Focus NFe (para emissão de NFC-e)
- ✅ Credenciais SafraPay (para pagamentos)
- ✅ Credenciais SMTP (para envio de e-mails) - **SMTP.arrozbemcasado.com.br**
- ✅ Credenciais Mailchimp (para newsletter)
- ✅ Certificado digital A1 (para assinatura de NFC-e)

---

## 🚀 Opção Recomendada: Deploy no Railway

O **Railway** é a opção mais simples e completa para este projeto. Ele oferece:

- ✅ Deploy automático via Git
- ✅ Banco de dados MySQL incluído
- ✅ SSL automático
- ✅ Fácil configuração de variáveis de ambiente
- ✅ Logs em tempo real
- ✅ Custo previsível (~$10-20/mês)

### Passo 1: Criar Conta no Railway

1. Acesse: https://railway.app
2. Clique em "Start a New Project"
3. Faça login com GitHub (recomendado)

### Passo 2: Enviar Código para o GitHub

Antes de fazer o deploy, você precisa ter o código em um repositório Git:

```bash
# No seu computador local, dentro da pasta bem_casado_loja:
cd bem_casado_loja

# Inicializar repositório Git (se ainda não foi feito)
git init

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Preparar projeto para deploy em produção"

# Criar repositório no GitHub e conectar
# (Siga as instruções do GitHub para criar um novo repositório)
git remote add origin https://github.com/SEU_USUARIO/bem-casado-loja.git
git branch -M main
git push -u origin main
```

### Passo 3: Criar Projeto no Railway

1. No Railway, clique em "New Project"
2. Selecione "Deploy from GitHub repo"
3. Escolha o repositório `bem-casado-loja`
4. Railway detectará automaticamente que é um projeto Node.js

### Passo 4: Adicionar Banco de Dados MySQL

1. No projeto Railway, clique em "New"
2. Selecione "Database" > "Add MySQL"
3. Railway criará um banco MySQL e fornecerá a URL de conexão
4. Copie a `DATABASE_URL` (você usará no próximo passo)

### Passo 5: Configurar Variáveis de Ambiente

1. No Railway, clique no serviço da aplicação
2. Vá em "Variables"
3. Adicione todas as variáveis do arquivo `.env.example`:

```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=mysql://usuario:senha@host:porta/banco  # Fornecido pelo Railway
JWT_SECRET=sua_chave_secreta_jwt_aqui
FOCUS_NFE_TOKEN=seu_token_focus_nfe
FOCUS_NFE_ENV=production
CNPJ_EMPRESA=14295537000130
FOCUS_NFE_CSC=seu_csc_aqui
FOCUS_NFE_CSC_ID=000001
SAFRAPAY_API_URL=https://api.safrapay.com.br
SAFRAPAY_MERCHANT_ID=seu_merchant_id
SAFRAPAY_API_KEY=sua_api_key_safrapay
SMTP_HOST=SMTP.arrozbemcasado.com.br
SMTP_PORT=587
SMTP_SECURE=false
SMTP_EMAIL_USER=contato@arrozbemcasado.com.br
SMTP_EMAIL_PASS=sua_senha_email
SMTP_FROM_NAME=Bem Casado Alimentos
MAILCHIMP_API_KEY=sua_chave_mailchimp
MAILCHIMP_LIST_ID=seu_list_id
MAILCHIMP_SERVER_PREFIX=us1
TINY_ERP_TOKEN=seu_token_tiny_erp
```

### Passo 6: Executar Migrações do Banco

Após o deploy inicial, você precisa criar as tabelas no banco:

1. No Railway, vá em "Deployments"
2. Clique nos três pontos (...) do último deploy
3. Selecione "View Logs"
4. Abra um terminal e execute:

```bash
pnpm db:push
```

Ou configure um script de inicialização no `package.json`:

```json
"scripts": {
  "start": "pnpm db:push && NODE_ENV=production node dist/index.js"
}
```

### Passo 7: Configurar Domínio Personalizado

1. No Railway, vá em "Settings" do serviço
2. Clique em "Domains"
3. Clique em "Custom Domain"
4. Digite: `www.arrozbemcasado.com.br`
5. Railway fornecerá um registro CNAME
6. Vá no painel de controle do seu domínio e adicione o registro CNAME:
   - **Tipo:** CNAME
   - **Nome:** www
   - **Valor:** (fornecido pelo Railway, algo como `xxx.railway.app`)
   - **TTL:** 3600

7. Aguarde a propagação DNS (pode levar até 24 horas, mas geralmente é rápido)
8. Railway configurará automaticamente o certificado SSL

### Passo 8: Testar a Aplicação

1. Acesse: https://www.arrozbemcasado.com.br
2. Teste todas as funcionalidades:
   - ✅ Visualização de produtos
   - ✅ Adicionar ao carrinho
   - ✅ Aplicar cupons
   - ✅ Finalizar pedido via WhatsApp
   - ✅ Cadastro na newsletter
   - ✅ Página "Sobre Nós"
   - ✅ Clube VIP

---

## 🔧 Comandos Úteis

### Verificar Logs em Tempo Real
No Railway, vá em "Deployments" > "View Logs"

### Reiniciar Aplicação
No Railway, clique em "Redeploy"

### Fazer Backup do Banco
```bash
# No Railway, vá em "Database" > "Data" > "Export"
```

### Atualizar Código
```bash
# No seu computador:
git add .
git commit -m "Atualização da loja"
git push

# O Railway fará o deploy automático
```

---

## 🔒 Checklist de Segurança

Antes de colocar no ar, verifique:

- [ ] Todas as variáveis de ambiente estão configuradas
- [ ] `NODE_ENV=production` está definido
- [ ] Credenciais de PRODUÇÃO (não sandbox) estão sendo usadas
- [ ] Certificado SSL está ativo (HTTPS)
- [ ] Arquivo `.env` NÃO está no repositório Git
- [ ] Senhas fortes foram usadas para todas as credenciais
- [ ] Backup automático do banco está configurado
- [ ] Logs estão sendo monitorados

---

## 📊 Monitoramento e Manutenção

### Configurar Monitoramento de Erros (Opcional)

Adicione o Sentry para rastrear erros em produção:

1. Crie conta em: https://sentry.io
2. Adicione a variável de ambiente:
   ```
   SENTRY_DSN=sua_dsn_sentry
   ```

### Configurar Analytics (Opcional)

Para rastrear visitantes, adicione Google Analytics:

1. Crie propriedade em: https://analytics.google.com
2. Adicione as variáveis:
   ```
   VITE_ANALYTICS_ENDPOINT=https://analytics.google.com
   VITE_ANALYTICS_WEBSITE_ID=seu_id_analytics
   ```

### Backup Automático

O Railway faz backup automático do banco. Para backups adicionais:

1. Configure um cron job para exportar o banco diariamente
2. Armazene backups no S3 ou Google Drive

---

## 🆘 Solução de Problemas

### Erro: "Cannot connect to database"
- Verifique se a `DATABASE_URL` está correta
- Verifique se o banco MySQL está rodando no Railway

### Erro: "Focus NFe authentication failed"
- Verifique se o `FOCUS_NFE_TOKEN` está correto
- Verifique se `FOCUS_NFE_ENV=production`

### Erro: "SafraPay payment failed"
- Verifique se as credenciais SafraPay estão corretas
- Verifique se está usando a URL de produção

### Site não carrega após configurar domínio
- Aguarde propagação DNS (até 24 horas)
- Verifique se o registro CNAME está correto
- Use https://dnschecker.org para verificar

---

## 💰 Estimativa de Custos Mensais

| Item | Custo (R$) |
|------|------------|
| Railway (servidor + banco) | R$ 50-100 |
| Domínio (já tem) | R$ 0 |
| SSL (incluído) | R$ 0 |
| Focus NFe (por nota) | R$ 0,25/nota |
| SafraPay (taxa) | 2-4% por transação |
| Mailchimp (até 500 contatos) | Grátis |
| **Total Fixo** | **R$ 50-100/mês** |

---

## 📞 Suporte

Se precisar de ajuda durante o deploy:

- **Railway:** https://railway.app/help
- **Focus NFe:** https://focusnfe.com.br/suporte
- **SafraPay:** Contato comercial SafraPay
- **Documentação do projeto:** Veja os arquivos `.md` na pasta raiz

---

## ✅ Próximos Passos Após o Deploy

1. **Testar todas as funcionalidades** em produção
2. **Configurar analytics** para rastrear visitantes
3. **Criar campanhas de marketing** para divulgar a loja
4. **Monitorar logs** diariamente nos primeiros dias
5. **Coletar feedback** dos primeiros clientes
6. **Otimizar performance** baseado nos dados reais

---

**Boa sorte com o lançamento da Loja Bem Casado! 🎉**


---

## 🚀 Opção Avançada: Deploy em Subpath (www.arrozbemcasado.com.br/loja)

Se você já possui um site principal em `www.arrozbemcasado.com.br` e quer adicionar a loja como uma seção, você precisará de uma configuração de **Reverse Proxy** no seu servidor web (Apache, Nginx, etc.).

### 1. Configuração no Projeto

O projeto já está configurado para isso. Apenas certifique-se de que a variável de ambiente `BASE_PATH` está definida:

```bash
# No seu arquivo .env
BASE_PATH=/loja
```

### 2. Configuração do Servidor Web (Exemplo com Nginx)

Você precisará configurar seu servidor principal para redirecionar todo o tráfego de `/loja` para a aplicação da loja, que estará rodando em uma porta específica (ex: 3000).

Adicione a seguinte configuração no seu arquivo de servidor Nginx (ex: `/etc/nginx/sites-available/arrozbemcasado.com.br`):

```nginx
location /loja/ {
    # Remove o /loja do início da URL antes de passar para a aplicação
    rewrite ^/loja/(.*)$ /$1 break;

    # Redireciona para a aplicação da loja
    proxy_pass http://localhost:3000;

    # Configurações padrão de proxy
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

### Como Funciona:

1.  Um usuário acessa `www.arrozbemcasado.com.br/loja/produtos`.
2.  O Nginx captura essa requisição.
3.  Ele remove o `/loja` e envia a requisição `/produtos` para a aplicação da loja rodando na porta 3000.
4.  A aplicação da loja recebe a requisição `/produtos` e responde corretamente.
5.  O Nginx devolve a resposta para o usuário.

**Importante:** Esta configuração exige que você tenha acesso ao servidor web do seu domínio principal. Se você usa uma hospedagem compartilhada, verifique se ela permite a configuração de Reverse Proxy.
