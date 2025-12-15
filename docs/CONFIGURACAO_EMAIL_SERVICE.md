# 📧 Configuração do EmailService com Nodemailer

Este documento explica como configurar o EmailService para envio automatizado de emails pelos agentes do sistema.

---

## 🎯 Visão Geral

O **EmailService** usa **Nodemailer** com SMTP do Gmail para enviar emails automaticamente. Ele suporta:

- ✅ **HTML completo** (templates visuais)
- ✅ **Múltiplos destinatários** (to, cc, bcc)
- ✅ **Prioridades** (crítico, alto, normal, baixo)
- ✅ **Anexos** (PDFs, imagens, etc)
- ✅ **Funcionamento 24/7** (não depende de interação manual)
- ✅ **Produção-ready** (confiável e escalável)

---

## 📋 Pré-requisitos

### 1. Conta Gmail com Autenticação de 2 Fatores

Para usar o SMTP do Gmail, você precisa:

1. Ter uma conta Gmail (ex: `noreply@arrozbemcasado.com.br`)
2. Habilitar **autenticação de 2 fatores**
3. Gerar uma **senha de app**

---

## 🔧 Passo a Passo de Configuração

### **Passo 1: Habilitar Autenticação de 2 Fatores**

1. Acesse: https://myaccount.google.com/security
2. Clique em **"Verificação em duas etapas"**
3. Siga as instruções para habilitar

### **Passo 2: Gerar Senha de App**

1. Acesse: https://myaccount.google.com/apppasswords
2. Em "Selecionar app", escolha **"Outro (nome personalizado)"**
3. Digite: **"ERP Bem Casado - Nodemailer"**
4. Clique em **"Gerar"**
5. **Copie a senha gerada** (16 caracteres, ex: `abcd efgh ijkl mnop`)

### **Passo 3: Configurar no Projeto**

Adicione as credenciais no arquivo `.env` na raiz do projeto:

```bash
# Configuração de Email (Nodemailer)
SMTP_EMAIL_USER=noreply@arrozbemcasado.com.br
SMTP_EMAIL_PASS=abcdefghijklmnop

# OU use os nomes alternativos:
GMAIL_USER=noreply@arrozbemcasado.com.br
GMAIL_APP_PASSWORD=abcdefghijklmnop
```

**⚠️ IMPORTANTE**: 
- Remova os espaços da senha de app (use `abcdefghijklmnop`, não `abcd efgh ijkl mnop`)
- Nunca commite o `.env` no Git (já está no `.gitignore`)

---

## 🧪 Testando a Configuração

### **Teste Rápido (Recomendado)**

```bash
cd /home/ubuntu/bem_casado_loja
node test-email-nodemailer.mjs
```

**Resultado esperado**:

```
🧪 Testando envio de email via Nodemailer...

✅ Credenciais encontradas
   Email: noreply@arrozbemcasado.com.br
   Senha: ****************

📧 Enviando email de teste...
   Para: diretoria@arrozbemcasado.com.br
   Assunto: 🧪 Teste de Integração - EmailService + Nodemailer

✅ Email enviado com sucesso!
   Message ID: <abc123@gmail.com>
   Response: 250 2.0.0 OK

🎉 Teste concluído com sucesso!

📝 Próximos passos:
   1. Verificar a caixa de entrada de diretoria@arrozbemcasado.com.br
   2. Confirmar recebimento do email de teste
   3. Integrar EmailService nos agentes
```

### **Teste Completo (Todos os Templates)**

```bash
cd /home/ubuntu/bem_casado_loja
npx tsx server/examples/emailExamples.ts
```

---

## 💻 Usando o EmailService no Código

### **1. Importar o Serviço**

```typescript
import { emailService } from '../services/emailService';
import { EmailTemplates } from '../templates/emailTemplates';
```

### **2. Enviar Email Simples**

```typescript
const result = await emailService.send({
  to: 'diretoria@arrozbemcasado.com.br',
  subject: 'Teste de Email',
  html: '<h1>Olá!</h1><p>Este é um teste.</p>'
});

if (result.success) {
  console.log('Email enviado:', result.messageId);
} else {
  console.error('Erro:', result.error);
}
```

### **3. Enviar Relatório de Legislação Fiscal**

```typescript
// Preparar dados
const reportData = {
  date: new Date().toLocaleDateString('pt-BR', { /* ... */ }),
  criticalAlerts: [
    {
      title: 'Certificado Digital vence em 15 dias',
      source: 'Sistema',
      publishedAt: '13/12/2024',
      deadline: '30/12/2024',
      description: 'Renovar certificado imediatamente',
      impact: 'CRÍTICO',
      action: 'Contatar Autoridade Certificadora'
    }
  ],
  douPublications: [],
  opportunities: [],
  obligationsNext30Days: []
};

// Gerar HTML
const html = EmailTemplates.taxLegislationReport(reportData);

// Enviar
const result = await emailService.sendTaxLegislationReport({
  to: 'diretoria@arrozbemcasado.com.br',
  cc: ['fiscal@arrozbemcasado.com.br'],
  html
});
```

### **4. Enviar Alerta Crítico**

```typescript
const html = EmailTemplates.criticalAlert({
  title: 'Certificado Digital Vencendo',
  description: 'O certificado vence em 15 dias...',
  impact: 'CRÍTICO - Operação pode parar',
  action: 'Renovar certificado imediatamente',
  deadline: '30/12/2024'
});

const result = await emailService.sendCriticalAlert({
  to: 'diretoria@arrozbemcasado.com.br',
  cc: ['ti@arrozbemcasado.com.br'],
  subject: 'Certificado Digital Vencendo',
  html
});
```

### **5. Enviar com Anexos**

```typescript
const result = await emailService.send({
  to: 'diretoria@arrozbemcasado.com.br',
  subject: 'Relatório Mensal',
  html: '<h1>Relatório em anexo</h1>',
  attachments: [
    {
      filename: 'relatorio.pdf',
      path: '/path/to/relatorio.pdf'
    }
  ]
});
```

---

## 🤖 Integrando nos Agentes

### **Agente de Legislação Fiscal**

```typescript
// server/agents/taxLegislationAgent.ts

import { emailService } from '../services/emailService';
import { EmailTemplates } from '../templates/emailTemplates';

export class TaxLegislationAgent {
  
  async sendDailyReport() {
    // 1. Coletar dados
    const reportData = {
      date: new Date().toLocaleDateString('pt-BR', { /* ... */ }),
      criticalAlerts: await this.getCriticalAlerts(),
      douPublications: await this.getDOUPublications(),
      opportunities: await this.getOpportunities(),
      obligationsNext30Days: await this.getObligations()
    };
    
    // 2. Gerar HTML
    const html = EmailTemplates.taxLegislationReport(reportData);
    
    // 3. Enviar
    const result = await emailService.sendTaxLegislationReport({
      to: 'diretoria@arrozbemcasado.com.br',
      cc: ['fiscal@arrozbemcasado.com.br'],
      html
    });
    
    if (result.success) {
      console.log('[TaxAgent] Relatório enviado:', result.messageId);
    } else {
      console.error('[TaxAgent] Erro ao enviar:', result.error);
    }
  }
}
```

### **Agente de Relatórios Diários**

```typescript
// server/agents/dailyReportAgent.ts

import { emailService } from '../services/emailService';
import { EmailTemplates } from '../templates/emailTemplates';

export class DailyReportAgent {
  
  async sendConsolidatedReport() {
    // 1. Compilar dados de todos os agentes
    const reportData = {
      date: new Date().toLocaleDateString('pt-BR', { /* ... */ }),
      sales: await this.getSalesData(),
      inventory: await this.getInventoryData(),
      financial: await this.getFinancialData(),
      production: await this.getProductionData(),
      highlights: await this.getHighlights(),
      alerts: await this.getAlerts()
    };
    
    // 2. Gerar HTML
    const html = EmailTemplates.consolidatedDailyReport(reportData);
    
    // 3. Enviar
    const result = await emailService.sendConsolidatedDailyReport({
      to: 'diretoria@arrozbemcasado.com.br',
      html
    });
    
    if (result.success) {
      console.log('[DailyAgent] Relatório consolidado enviado:', result.messageId);
    } else {
      console.error('[DailyAgent] Erro ao enviar:', result.error);
    }
  }
}
```

---

## ⏰ Agendamento com Cron

Para enviar emails automaticamente todos os dias, use cron:

```typescript
// server/scheduler.ts

import cron from 'node-cron';
import { TaxLegislationAgent } from './agents/taxLegislationAgent';
import { DailyReportAgent } from './agents/dailyReportAgent';

const taxAgent = new TaxLegislationAgent();
const dailyAgent = new DailyReportAgent();

// Agente de Legislação Fiscal - Todos os dias às 08:00
cron.schedule('0 8 * * *', async () => {
  console.log('[CRON] Executando Agente de Legislação Fiscal...');
  try {
    await taxAgent.sendDailyReport();
    console.log('[CRON] Relatório de legislação enviado');
  } catch (error) {
    console.error('[CRON] Erro:', error);
  }
});

// Agente de Relatórios Diários - Todos os dias às 07:00
cron.schedule('0 7 * * *', async () => {
  console.log('[CRON] Executando Agente de Relatórios Diários...');
  try {
    await dailyAgent.sendConsolidatedReport();
    console.log('[CRON] Relatório consolidado enviado');
  } catch (error) {
    console.error('[CRON] Erro:', error);
  }
});

console.log('[SCHEDULER] Agendamentos configurados:');
console.log('  - Legislação Fiscal: 08:00 (seg-dom)');
console.log('  - Relatório Consolidado: 07:00 (seg-dom)');
```

---

## 🔍 Verificando Configuração

### **Verificar se está configurado**

```typescript
import { emailService } from './services/emailService';

if (emailService.isConfigured()) {
  console.log('✅ EmailService configurado');
} else {
  console.error('❌ EmailService não configurado');
  console.error('Configure SMTP_EMAIL_USER e SMTP_EMAIL_PASS no .env');
}
```

---

## ⚠️ Troubleshooting

### **Erro: "Invalid login"**

**Causa**: Senha de app incorreta ou autenticação de 2 fatores não habilitada

**Solução**:
1. Verifique se a autenticação de 2 fatores está habilitada
2. Gere uma nova senha de app
3. Remova os espaços da senha
4. Atualize o `.env`

### **Erro: "Connection timeout"**

**Causa**: Firewall bloqueando porta 587

**Solução**:
1. Verifique se a porta 587 está aberta
2. Tente usar porta 465 (SSL):
   ```typescript
   port: 465,
   secure: true
   ```

### **Erro: "Daily sending quota exceeded"**

**Causa**: Gmail tem limite de 500 emails/dia para contas gratuitas

**Solução**:
1. Use Google Workspace (limite de 2.000/dia)
2. Ou use serviço dedicado (SendGrid, Mailgun)

---

## 📊 Limites do Gmail

| Tipo de Conta | Limite Diário | Limite por Hora |
|---------------|---------------|-----------------|
| Gmail Gratuito | 500 emails | ~100 emails |
| Google Workspace | 2.000 emails | ~500 emails |

**Para o sistema Bem Casado** (6 agentes, 1 email/dia cada):
- ✅ **6 emails/dia** - Muito abaixo do limite
- ✅ **~180 emails/mês** - Sem problemas

---

## ✅ Checklist de Configuração

- [ ] Conta Gmail criada (ex: noreply@arrozbemcasado.com.br)
- [ ] Autenticação de 2 fatores habilitada
- [ ] Senha de app gerada
- [ ] Credenciais adicionadas no `.env`
- [ ] Teste executado com sucesso (`node test-email-nodemailer.mjs`)
- [ ] Email recebido na caixa de entrada
- [ ] EmailService integrado nos agentes
- [ ] Agendamento configurado (cron)

---

## 📚 Recursos Adicionais

- [Documentação Nodemailer](https://nodemailer.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)

---

**Status**: ✅ EmailService pronto para uso em produção!
