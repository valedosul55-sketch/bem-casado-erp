# 📧 Configuração Gmail SMTP para Newsletter

Este documento explica como configurar o envio de emails da newsletter via Gmail SMTP.

---

## 🎯 Variáveis de Ambiente Necessárias

Adicione estas variáveis no Railway:

```env
SMTP_EMAIL_USER=valedosul55@gmail.com
SMTP_EMAIL_PASS=wnys qpts mafd ipmb
```

---

## 📝 Como Gerar Senha de Aplicativo do Gmail

### Passo 1: Ativar Verificação em 2 Etapas

1. Acesse: https://myaccount.google.com/security
2. Clique em **"Verificação em duas etapas"**
3. Siga as instruções para ativar

### Passo 2: Gerar Senha de Aplicativo

1. Acesse: https://myaccount.google.com/apppasswords
2. Faça login com o email da loja
3. Selecione:
   - **App:** Email
   - **Dispositivo:** Outro (nome personalizado)
   - Digite: "Loja Bem Casado"
4. Clique em **"Gerar"**
5. **Copie a senha de 16 dígitos** (ex: `abcd efgh ijkl mnop`)

---

## 🚀 Configurar no Railway

### Via Dashboard (Recomendado)

1. Acesse: https://railway.app
2. Vá no projeto **bem-casado-loja**
3. Clique em **"Variables"**
4. Adicione:
   - `SMTP_EMAIL_USER` = `valedosul55@gmail.com`
   - `SMTP_EMAIL_PASS` = `wnys qpts mafd ipmb`
5. Clique em **"Save"**
6. O Railway fará redeploy automático

### Via Railway CLI

```bash
railway variables set SMTP_EMAIL_USER=valedosul55@gmail.com
railway variables set SMTP_EMAIL_PASS="wnys qpts mafd ipmb"
```

---

## ✅ Funcionalidades

Com o Gmail SMTP configurado, a newsletter enviará automaticamente:

### Email de Boas-Vindas

Quando um usuário se cadastra na newsletter, ele recebe:

- ✉️ **Email profissional** com layout responsivo
- 🎁 **Cupom de desconto** NEWSLETTER5 (5% OFF)
- 🏪 **Link direto** para a loja
- 📍 **Endereço e horário** de funcionamento
- 📦 **Benefícios** da newsletter

### Conteúdo do Email

- Design moderno com cores da marca (rosa/vermelho)
- Cupom destacado em caixa especial
- Botão para ir direto à loja
- Lista de benefícios da newsletter
- Informações de contato e localização

---

## 📊 Limites do Gmail

| Tipo de Conta | Limite Diário | Recomendação |
|---------------|---------------|--------------|
| Gmail Gratuito | 500 emails/dia | Ideal para começar |
| Google Workspace | 2.000 emails/dia | Para crescimento |

**Observação:** Se ultrapassar o limite, o Gmail bloqueia envio por 24h (mas não fecha a conta).

---

## 🔧 Solução de Problemas

### Erro: "Invalid login"

- Verifique se a senha de aplicativo está correta
- Confirme que a verificação em 2 etapas está ativa
- Gere uma nova senha de aplicativo

### Erro: "Daily limit exceeded"

- Você atingiu o limite de 500 emails/dia
- Aguarde 24h ou migre para Google Workspace

### Emails não chegam

- Verifique a pasta de SPAM
- Confirme que as variáveis estão configuradas no Railway
- Veja os logs do Railway para erros

---

## 📈 Migração Futura

Quando a loja crescer, considere migrar para:

- **SendGrid** - 100 emails/dia grátis, depois pago
- **Mailchimp** - Até 500 contatos grátis
- **Resend** - 3.000 emails/mês grátis
- **Google Workspace** - 2.000 emails/dia

---

## 🔐 Segurança

- ✅ Senha de aplicativo é diferente da senha normal
- ✅ Pode ser revogada a qualquer momento
- ✅ Não dá acesso total à conta Gmail
- ✅ Específica apenas para envio de emails

---

**Configurado em:** 08/12/2025
**Email configurado:** valedosul55@gmail.com
**Status:** ✅ Ativo
