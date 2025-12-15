# 💰 Agente Financeiro (Financial Agent)

## 📋 Visão Geral

O **Agente Financeiro** é responsável pela gestão completa do fluxo de caixa, contas a pagar e receber, conciliação bancária e análise de indicadores financeiros. Trabalha em conjunto com o Agente de Contabilidade, mas com foco em **gestão de liquidez e operações financeiras**.

---

## 🎯 Objetivo e Escopo

### Objetivo Principal

Garantir a **saúde financeira** da empresa através do monitoramento contínuo de caixa, gestão eficiente de pagamentos e recebimentos, e análise proativa de indicadores de liquidez.

### Diferença do Agente de Contabilidade

| Aspecto | Agente de Contabilidade | Agente Financeiro |
|---------|------------------------|-------------------|
| **Foco** | Conformidade contábil | Gestão de caixa |
| **Responsável** | Contador | Gerente Financeiro |
| **Regime** | Competência | Caixa |
| **Objetivo** | Demonstrações contábeis | Liquidez e solvência |
| **Ferramentas** | DRE, Balanço | Fluxo de caixa, DFC |

---

## 📊 Responsabilidades Principais

### 1. Gestão de Fluxo de Caixa

**Monitoramento Diário**:
- Saldo de caixa e bancos em tempo real
- Entradas do dia (vendas, recebimentos)
- Saídas do dia (pagamentos, despesas)
- Projeção de saldo para os próximos 7, 15 e 30 dias

**Alertas Automáticos**:
- Saldo abaixo do mínimo operacional
- Concentração de pagamentos em uma data
- Recebimentos atrasados
- Oportunidades de aplicação financeira

### 2. Contas a Pagar

**Gestão de Fornecedores**:
- Registro de contas a pagar
- Controle de vencimentos
- Negociação de prazos (sugestões)
- Priorização de pagamentos

**Automações**:
- Alerta 3 dias antes do vencimento
- Sugestão de pagamentos antecipados com desconto
- Identificação de duplicatas
- Controle de multas e juros

### 3. Contas a Receber

**Gestão de Clientes**:
- Registro de contas a receber
- Controle de inadimplência
- Cobrança automatizada
- Análise de crédito

**Automações**:
- Envio de lembretes de vencimento
- Cobrança automática de atrasados
- Cálculo de juros e multas
- Sugestão de descontos para antecipação

### 4. Conciliação Bancária

**Integração Bancária**:
- Importação de extratos bancários (OFX, API)
- Conciliação automática com lançamentos
- Identificação de divergências
- Sugestão de ajustes

**Validações**:
- Conferência de saldos
- Identificação de lançamentos duplicados
- Detecção de fraudes
- Auditoria de movimentações

### 5. Análise de Indicadores Financeiros

**KPIs Monitorados**:
- **Liquidez Corrente**: Ativo Circulante / Passivo Circulante
- **Liquidez Seca**: (AC - Estoques) / PC
- **Prazo Médio de Recebimento**: (Contas a Receber / Vendas) × 30
- **Prazo Médio de Pagamento**: (Contas a Pagar / Compras) × 30
- **Ciclo Operacional**: PMR + Giro de Estoque
- **Ciclo Financeiro**: Ciclo Operacional - PMP

**Análises**:
- Tendências de liquidez
- Capital de giro necessário
- Necessidade de financiamento
- Oportunidades de otimização

---

## 🤖 Ferramentas MCP Utilizadas

### Gmail
- Enviar alertas de vencimentos
- Notificar sobre saldo baixo
- Enviar cobranças automáticas
- Relatórios financeiros semanais

### Notion
- Documentar políticas financeiras
- Manter calendário de pagamentos
- Registrar negociações com fornecedores
- Base de conhecimento de crédito

### Google Calendar
- Agendar pagamentos
- Marcar vencimentos
- Programar conciliações bancárias
- Reuniões de análise financeira

---

## 📅 Rotinas Automatizadas

### Diária (08:00)
```typescript
async dailyRoutine() {
  // 1. Atualizar saldo de caixa
  const cashBalance = await this.updateCashBalance();
  
  // 2. Verificar vencimentos do dia
  const dueTodayPayments = await this.checkDuePayments(new Date());
  
  // 3. Verificar recebimentos esperados
  const expectedReceipts = await this.checkExpectedReceipts(new Date());
  
  // 4. Calcular projeção de saldo
  const projection = await this.projectCashFlow(7); // 7 dias
  
  // 5. Alertar se necessário
  if (cashBalance < MIN_CASH_BALANCE) {
    await this.alertLowCash(cashBalance);
  }
  
  // 6. Enviar resumo ao gerente financeiro
  await this.sendDailySummary({
    cashBalance,
    dueTodayPayments,
    expectedReceipts,
    projection
  });
}
```

### Semanal (Segunda-feira 09:00)
```typescript
async weeklyRoutine() {
  // 1. Conciliação bancária da semana anterior
  const reconciliation = await this.reconcileBankStatements();
  
  // 2. Análise de inadimplência
  const overdueAnalysis = await this.analyzeOverdueReceivables();
  
  // 3. Projeção de fluxo de caixa (30 dias)
  const monthlyProjection = await this.projectCashFlow(30);
  
  // 4. Cálculo de indicadores
  const kpis = await this.calculateFinancialKPIs();
  
  // 5. Relatório semanal
  await this.sendWeeklyReport({
    reconciliation,
    overdueAnalysis,
    monthlyProjection,
    kpis
  });
}
```

### Mensal (Dia 1º às 10:00)
```typescript
async monthlyRoutine() {
  // 1. Fechamento do mês anterior
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  // 2. Demonstração de Fluxo de Caixa (DFC)
  const dfc = await this.generateCashFlowStatement(lastMonth);
  
  // 3. Análise de capital de giro
  const workingCapital = await this.analyzeWorkingCapital();
  
  // 4. Indicadores financeiros
  const financialIndicators = await this.calculateMonthlyIndicators();
  
  // 5. Relatório gerencial
  await this.sendMonthlyReport({
    dfc,
    workingCapital,
    financialIndicators
  });
  
  // 6. Salvar no Notion
  await this.saveToNotion(lastMonth, {
    dfc,
    workingCapital,
    financialIndicators
  });
}
```

---

## 📧 Exemplo de Relatório Diário

```
💰 RELATÓRIO FINANCEIRO DIÁRIO
📅 Sexta-feira, 13 de Dezembro de 2024

💵 SALDO DE CAIXA
• Caixa: R$ 12.450,00
• Banco Bradesco: R$ 145.230,00
• Banco Itaú: R$ 29.750,00
• TOTAL: R$ 187.430,00 ✅

📥 ENTRADAS DO DIA
• Vendas à Vista: R$ 38.200,00
• Recebimentos: R$ 12.450,00
• TOTAL: R$ 50.650,00

📤 SAÍDAS DO DIA
• Fornecedores: R$ 15.800,00
• Despesas Operacionais: R$ 3.200,00
• TOTAL: R$ 19.000,00

💵 RESULTADO DO DIA: +R$ 31.650,00 ✅

📋 VENCIMENTOS HOJE
• Fornecedor ABC - R$ 8.500,00 (NF-e 12345) ⚠️
• Aluguel Filial RJ - R$ 4.200,00 ⚠️
• TOTAL: R$ 12.700,00

📊 PROJEÇÃO 7 DIAS
Dia        | Entradas    | Saídas      | Saldo Projetado
-----------|-------------|-------------|----------------
14/12 (Sáb)| R$ 35.000   | R$ 8.000    | R$ 214.430
15/12 (Dom)| R$ 28.000   | R$ 5.000    | R$ 237.430
16/12 (Seg)| R$ 42.000   | R$ 15.000   | R$ 264.430
17/12 (Ter)| R$ 40.000   | R$ 12.300   | R$ 292.130
18/12 (Qua)| R$ 38.000   | R$ 83.880 ⚠️| R$ 246.250
19/12 (Qui)| R$ 41.000   | R$ 10.000   | R$ 277.250
20/12 (Sex)| R$ 45.000   | R$ 18.000   | R$ 304.250

⚠️ ALERTAS
1. Concentração de pagamentos dia 18/12 (R$ 83.880)
   • Ação: Monitorar recebimentos
   • Saldo projetado: R$ 246.250 (acima do mínimo)

2. Cliente Empresa XYZ - Atraso de 5 dias (R$ 3.200)
   • Ação: Enviar cobrança automática

✅ SITUAÇÃO: SAUDÁVEL
Saldo atual acima do mínimo operacional (R$ 150.000)
```

---

## 📊 Exemplo de Relatório Mensal

```
💰 DEMONSTRAÇÃO DE FLUXO DE CAIXA (DFC)
Novembro/2024

🔵 ATIVIDADES OPERACIONAIS
(+) Recebimentos de Clientes:        R$ 1.245.600,00
(-) Pagamentos a Fornecedores:        R$ (685.400,00)
(-) Pagamentos de Salários:           R$ (120.000,00)
(-) Pagamentos de Despesas:           R$ (85.200,00)
(=) Caixa Líquido Operacional:        R$ 355.000,00 ✅

🟢 ATIVIDADES DE INVESTIMENTO
(-) Aquisição de Equipamentos:        R$ (45.000,00)
(=) Caixa Líquido de Investimento:    R$ (45.000,00)

🟠 ATIVIDADES DE FINANCIAMENTO
(+) Empréstimos Obtidos:              R$ 0,00
(-) Pagamento de Empréstimos:         R$ (15.000,00)
(-) Pagamento de Juros:               R$ (2.500,00)
(=) Caixa Líquido de Financiamento:   R$ (17.500,00)

💵 VARIAÇÃO LÍQUIDA DE CAIXA:         R$ 292.500,00 ✅
💰 Saldo Inicial:                     R$ 125.000,00
💰 Saldo Final:                       R$ 417.500,00

📊 INDICADORES FINANCEIROS

Liquidez:
• Liquidez Corrente: 2.8 (meta: >1.5) ✅
• Liquidez Seca: 1.9 (meta: >1.0) ✅

Prazos:
• Prazo Médio de Recebimento: 18 dias
• Prazo Médio de Pagamento: 25 dias
• Ciclo Financeiro: 35 dias

Capital de Giro:
• Capital de Giro Líquido: R$ 520.000,00
• Necessidade de Capital de Giro: R$ 380.000,00
• Saldo de Tesouraria: R$ 140.000,00 ✅

💡 ANÁLISE

✅ Geração de caixa operacional forte (R$ 355k)
✅ Liquidez saudável (2.8x)
✅ Prazo de pagamento > recebimento (folga de 7 dias)
⚠️ Ciclo financeiro pode ser otimizado (35 dias)

🎯 RECOMENDAÇÕES

1. Negociar prazo maior com fornecedores (+5 dias)
2. Incentivar pagamento antecipado de clientes (desconto 2%)
3. Avaliar aplicação de R$ 140k em CDB (rendimento extra)
```

---

## 🔧 Implementação Técnica

### Estrutura do Agente

```typescript
// server/agents/financialAgent.ts

import { MCPClient } from '@manus/mcp-client';
import { db } from '../db';

export class FinancialAgent {
  private mcp: MCPClient;
  
  constructor() {
    this.mcp = new MCPClient({
      servers: {
        gmail: { enabled: true },
        notion: { enabled: true },
        calendar: { enabled: true }
      }
    });
  }
  
  async updateCashBalance() {
    // Consultar saldo de todas as contas
    const accounts = await db.query(`
      SELECT 
        account_type,
        SUM(balance) as total_balance
      FROM bank_accounts
      WHERE active = true
      GROUP BY account_type
    `);
    
    return {
      cash: accounts.find(a => a.account_type === 'cash')?.total_balance || 0,
      bank: accounts.find(a => a.account_type === 'bank')?.total_balance || 0,
      total: accounts.reduce((sum, a) => sum + a.total_balance, 0)
    };
  }
  
  async checkDuePayments(date: Date) {
    return await db.query(`
      SELECT 
        ap.id,
        s.name as supplier_name,
        ap.invoice_number,
        ap.amount,
        ap.due_date
      FROM accounts_payable ap
      JOIN suppliers s ON ap.supplier_id = s.id
      WHERE DATE(ap.due_date) = DATE($1)
        AND ap.status = 'pending'
      ORDER BY ap.amount DESC
    `, [date]);
  }
  
  async projectCashFlow(days: number) {
    const projections = [];
    const currentDate = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() + i);
      
      // Projetar entradas
      const expectedInflows = await this.calculateExpectedInflows(date);
      
      // Projetar saídas
      const expectedOutflows = await this.calculateExpectedOutflows(date);
      
      // Calcular saldo projetado
      const projectedBalance = expectedInflows - expectedOutflows;
      
      projections.push({
        date,
        inflows: expectedInflows,
        outflows: expectedOutflows,
        balance: projectedBalance
      });
    }
    
    return projections;
  }
  
  async calculateFinancialKPIs() {
    // Liquidez Corrente
    const currentAssets = await this.getTotalCurrentAssets();
    const currentLiabilities = await this.getTotalCurrentLiabilities();
    const currentRatio = currentAssets / currentLiabilities;
    
    // Liquidez Seca
    const inventory = await this.getTotalInventory();
    const quickRatio = (currentAssets - inventory) / currentLiabilities;
    
    // Prazos médios
    const avgReceivableDays = await this.calculateAvgReceivableDays();
    const avgPayableDays = await this.calculateAvgPayableDays();
    
    return {
      currentRatio,
      quickRatio,
      avgReceivableDays,
      avgPayableDays,
      operatingCycle: avgReceivableDays + 30, // + giro de estoque
      financialCycle: avgReceivableDays + 30 - avgPayableDays
    };
  }
  
  async sendDailySummary(data: any) {
    await this.mcp.gmail.send({
      to: "gerente.financeiro@bemcasado.com.br",
      subject: `💰 Relatório Financeiro Diário - ${new Date().toLocaleDateString('pt-BR')}`,
      html: this.formatDailySummary(data)
    });
  }
}
```

---

## 📊 Integração com Outros Agentes

### Com Agente de Contabilidade
- Recebe lançamentos contábeis para atualizar contas a pagar/receber
- Fornece dados de caixa para conciliação contábil
- Compartilha indicadores financeiros

### Com Agente Fiscal
- Recebe valores de impostos a pagar
- Agenda pagamentos de guias (DARE, DARF)
- Monitora prazos de obrigações fiscais

### Com Agente de Relatórios Diários
- Fornece dados de fluxo de caixa
- Fornece contas a pagar/receber vencendo
- Fornece indicadores financeiros

---

## 🎯 Benefícios

✅ **Visibilidade**: Saldo de caixa em tempo real  
✅ **Previsibilidade**: Projeção de fluxo de caixa  
✅ **Controle**: Gestão eficiente de pagamentos e recebimentos  
✅ **Automação**: Alertas e cobranças automáticas  
✅ **Análise**: Indicadores financeiros atualizados  
✅ **Decisão**: Dados para tomada de decisão financeira  

---

**Documento preparado por**: Equipe de Arquitetura Bem Casado  
**Data**: Dezembro 2024  
**Versão**: 1.0
