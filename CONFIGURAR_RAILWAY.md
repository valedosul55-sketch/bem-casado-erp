# 🚀 Como Configurar Variáveis de Ambiente no Railway

## 📋 Passo a Passo

### 1️⃣ Acessar o Railway

1. Abra: https://railway.app
2. Faça login na sua conta
3. Clique no projeto **bem-casado-loja-production**

### 2️⃣ Abrir Configurações de Variáveis

1. No projeto, clique na aba **"Variables"** (ou "Variáveis")
2. Você verá uma lista das variáveis já configuradas

### 3️⃣ Adicionar as Novas Variáveis

Clique em **"New Variable"** (ou "+ Add Variable") e adicione:

**Variável 1:**
```
Nome: SMTP_EMAIL_USER
Valor: valedosul55@gmail.com
```

**Variável 2:**
```
Nome: SMTP_EMAIL_PASS
Valor: wnys qpts mafd ipmb
```

### 4️⃣ Salvar

1. Clique em **"Add"** ou **"Save"**
2. O Railway fará **redeploy automático** (leva 2-3 minutos)

---

## ✅ Verificar se Funcionou

Após o deploy terminar (você verá "Deployed" no Railway):

1. Acesse: https://bem-casado-loja-production.up.railway.app/loja/
2. Role até o final da página
3. Cadastre um email de teste na newsletter
4. Verifique se recebeu o email de boas-vindas

---

## 📸 Referência Visual

```
┌─────────────────────────────────────┐
│ Railway Dashboard                    │
├─────────────────────────────────────┤
│ bem-casado-loja-production          │
│                                      │
│ [Deployments] [Variables] [Settings]│
│         ▲                            │
│         └─ Clique aqui               │
│                                      │
│ ┌─────────────────────────────────┐ │
│ │ + New Variable                   │ │
│ ├─────────────────────────────────┤ │
│ │ Name: SMTP_EMAIL_USER            │ │
│ │ Value: valedosul55@gmail.com     │ │
│ │                                  │ │
│ │ [Add]                            │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## ⚠️ Importante

- As variáveis são **secretas** - não compartilhe
- O Railway faz **redeploy automático** ao salvar
- Aguarde 2-3 minutos para o deploy terminar
- Verifique os **logs** se houver erro

---

## 🔍 Ver Logs (se necessário)

1. No Railway, clique em **"Deployments"**
2. Clique no deploy mais recente
3. Veja os logs em tempo real
4. Procure por `[Newsletter Email]` para ver status dos emails

---

**Após configurar, me avise que vou fazer o commit e deploy do código!** 🚀
