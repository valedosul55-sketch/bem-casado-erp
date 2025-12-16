# Variáveis de Ambiente para Railway - ERP Bem Casado

## Variáveis Obrigatórias

### Banco de Dados
```
DATABASE_URL=mysql://user:password@host:port/database
```
> **Nota:** O Railway gera automaticamente esta variável quando você adiciona um serviço MySQL.
> Use a referência `${{MySQL.DATABASE_URL}}` para conectar automaticamente.

### Autenticação
```
JWT_SECRET=sua-chave-secreta-aqui-minimo-32-caracteres
```
> Gere uma chave aleatória segura. Exemplo: `openssl rand -hex 32`

### Ambiente
```
NODE_ENV=production
PORT=3000
```

## Variáveis do Manus OAuth (Opcionais para produção externa)

Se você quiser usar autenticação Manus OAuth em produção:
```
VITE_APP_ID=seu-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im/login
```

## Passos no Railway

1. **Adicionar MySQL:**
   - No projeto, clique em "Add Service" > "Database" > "MySQL"
   - O Railway criará automaticamente a variável `DATABASE_URL`

2. **Configurar Variáveis:**
   - Clique no serviço do seu app (não no MySQL)
   - Vá em "Variables"
   - Adicione as variáveis listadas acima

3. **Conectar ao MySQL:**
   - Na variável `DATABASE_URL` do seu app, use: `${{MySQL.DATABASE_URL}}`
   - Isso conecta automaticamente ao banco MySQL do Railway

4. **Redeploy:**
   - Após configurar as variáveis, faça um redeploy para aplicar
