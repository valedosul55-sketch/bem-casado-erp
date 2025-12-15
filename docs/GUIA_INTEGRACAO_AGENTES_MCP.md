# 🤖 Guia de Integração: Agentes MCP no ERP Bem Casado

## 📋 Visão Geral

Este documento detalha a integração dos **seis agentes MCP especializados** (Produção, Contabilidade, Financeiro, Fiscal, Relatórios Diários e Monitoramento de Notícias) no sistema ERP Bem Casado. Os agentes atuarão como assistentes inteligentes, automatizando tarefas complexas, sugerindo ações e garantindo conformidade operacional.

### Conceito de Agente MCP

O **Model Context Protocol (MCP)** permite que agentes de IA acessem ferramentas externas (Asana, Notion, Gmail, Calendar) de forma estruturada e segura. No contexto do ERP Bem Casado, os agentes MCP funcionam como **especialistas virtuais** que:

- Analisam dados do sistema em tempo real
- Sugerem ações baseadas em regras de negócio
- Executam tarefas automatizadas com aprovação humana
- Mantêm documentação e histórico de decisões
- Notificam equipes sobre eventos importantes

---

## 🏭 Agente 1: Produção (Manufacturing Agent)

### Objetivo e Escopo

O Agente de Produção é responsável por otimizar o planejamento e execução da manufatura, garantindo que a produção atenda à demanda com eficiência máxima e custos minimizados.

### Responsabilidades Principais

**Planejamento de Produção**:
O agente analisa o estoque atual de produtos acabados em todas as filiais e compara com a demanda histórica dos últimos 30, 60 e 90 dias. Produtos com estoque abaixo do mínimo ou com previsão de ruptura nos próximos 15 dias são priorizados para produção.

**Cálculo de Necessidade de Materiais (MRP)**:
Para cada ordem de produção sugerida, o agente calcula automaticamente a quantidade necessária de cada matéria-prima, considerando as receitas cadastradas e o percentual de perda esperado. Verifica se há estoque suficiente de matérias-primas e sugere compras quando necessário.

**Otimização de Sequenciamento**:
O agente propõe a sequência ideal de ordens de produção considerando fatores como prazo de validade das matérias-primas, tempo de setup de máquinas, prioridade de produtos (curva ABC) e capacidade produtiva disponível.

**Monitoramento de KPIs**:
Durante a execução, o agente monitora indicadores como OEE (Overall Equipment Effectiveness), tempo de ciclo, taxa de refugo e aderência ao plano. Desvios significativos geram alertas automáticos para o gerente de produção.

### Ferramentas MCP Utilizadas

**Asana**:
- Criar tarefas de produção para cada ordem
- Atribuir responsáveis e prazos
- Acompanhar status de execução
- Registrar problemas e ações corretivas

**Notion**:
- Documentar receitas e procedimentos
- Manter histórico de melhorias de processo
- Criar base de conhecimento de troubleshooting
- Registrar lições aprendidas

**Gmail**:
- Notificar gerente sobre ordens urgentes
- Enviar relatórios diários de produção
- Alertar sobre desvios de qualidade
- Solicitar aprovação para ordens especiais

**Google Calendar**:
- Agendar ordens de produção
- Reservar linhas de produção
- Programar manutenções preventivas
- Marcar reuniões de revisão de produção

### Fluxo de Trabalho Detalhado

#### Etapa 1: Análise de Demanda (Diária - 06:00)

```typescript
// Agente executa análise automática
const analysis = await agent.analyzeDemand({
  period: 30, // dias
  minStockThreshold: 1.5, // 1.5x estoque mínimo
  forecastDays: 15 // previsão de ruptura
});

// Resultado exemplo:
{
  productsAtRisk: [
    {
      productId: 1,
      name: "Arroz Integral 1kg",
      currentStock: 45,
      minStock: 100,
      avgDailySales: 12,
      daysUntilStockout: 3,
      priority: "CRITICAL"
    },
    {
      productId: 5,
      name: "Feijão Preto 1kg",
      currentStock: 78,
      minStock: 50,
      avgDailySales: 8,
      daysUntilStockout: 9,
      priority: "HIGH"
    }
  ]
}
```

#### Etapa 2: Sugestão de Ordens de Produção

```typescript
// Para cada produto em risco, agente sugere OP
const suggestions = await agent.suggestProductionOrders(analysis.productsAtRisk);

// Resultado exemplo:
{
  suggestions: [
    {
      productId: 1,
      productName: "Arroz Integral 1kg",
      suggestedQuantity: 500, // Repõe estoque + buffer
      recipeId: 1,
      estimatedCost: 425000, // R$ 4.250,00
      estimatedDuration: "8 horas",
      materialsNeeded: [
        { material: "Arroz em casca", quantity: 550, unit: "kg", available: 1200 },
        { material: "Embalagem 1kg", quantity: 500, unit: "un", available: 2000 }
      ],
      materialsAvailable: true,
      priority: "CRITICAL",
      suggestedStartDate: "2024-12-14T08:00:00Z"
    }
  ]
}
```

#### Etapa 3: Criação de Tarefa no Asana

```typescript
// Agente cria tarefa automaticamente
await mcp.asana.createTask({
  name: "OP-2024-001: Produzir 500 un de Arroz Integral 1kg",
  description: `
    PRIORIDADE: CRÍTICA
    Estoque atual: 45 un (mínimo: 100 un)
    Previsão de ruptura: 3 dias
    
    Materiais necessários:
    - Arroz em casca: 550 kg (disponível: 1.200 kg) ✅
    - Embalagem 1kg: 500 un (disponível: 2.000 un) ✅
    
    Custo estimado: R$ 4.250,00
    Duração estimada: 8 horas
    
    Início sugerido: 14/12/2024 08:00
  `,
  assignee: "gerente.producao@bemcasado.com.br",
  due_date: "2024-12-14",
  priority: "high",
  project: "Ordens de Produção - Dezembro 2024"
});
```

#### Etapa 4: Notificação por Email

```typescript
// Agente envia email ao gerente
await mcp.gmail.send({
  to: "gerente.producao@bemcasado.com.br",
  subject: "🚨 Ordem de Produção CRÍTICA - Arroz Integral",
  body: `
    Olá, João!
    
    O Agente de Produção identificou uma situação crítica:
    
    📦 Produto: Arroz Integral 1kg
    📊 Estoque atual: 45 un (mínimo: 100 un)
    ⚠️ Previsão de ruptura: 3 dias
    
    💡 Sugestão: Produzir 500 unidades URGENTEMENTE
    
    ✅ Todos os materiais estão disponíveis
    💰 Custo estimado: R$ 4.250,00
    ⏱️ Duração: 8 horas
    
    Uma tarefa foi criada no Asana para acompanhamento.
    Acesse o sistema para aprovar a ordem de produção.
    
    --
    Agente de Produção Bem Casado
  `
});
```

#### Etapa 5: Aprovação Humana

```typescript
// Gerente acessa sistema e aprova
POST /api/production/orders/approve
Body: {
  suggestionId: "sugg-2024-001",
  approved: true,
  adjustments: {
    quantity: 600, // Gerente aumentou quantidade
    startDate: "2024-12-14T06:00:00Z" // Antecipou início
  }
}

// Sistema cria OP oficial
INSERT INTO production_orders (
  order_number, recipe_id, product_id, planned_quantity,
  status, start_date, responsible_user_id
) VALUES (
  'OP-2024-001', 1, 1, 600,
  'planned', '2024-12-14 06:00:00', 5
);
```

#### Etapa 6: Reserva de Materiais

```typescript
// Sistema reserva matérias-primas automaticamente
INSERT INTO material_reservations (
  production_order_id, raw_material_id, quantity_reserved
) VALUES
  (1, 1, 660), -- Arroz em casca (600 * 1.1 = 660 kg)
  (1, 2, 600); -- Embalagem 1kg

// Atualiza estoque disponível
UPDATE raw_materials
SET available_stock = current_stock - reserved_stock
WHERE id IN (1, 2);
```

#### Etapa 7: Monitoramento em Tempo Real

```typescript
// Durante a produção, operador aponta produção
POST /api/production/logs
Body: {
  productionOrderId: 1,
  quantityProduced: 150, // Primeiro lote
  quantityLoss: 5, // 5 unidades com defeito
  lossReason: "Embalagem rasgada",
  batchNumber: "BC-2024-12-001",
  expiryDate: "2025-12-14"
}

// Agente monitora e calcula KPIs
const kpis = {
  progressPercentage: 25, // 150/600
  lossRate: 3.2, // 5/155 * 100
  expectedLossRate: 2.0, // Definido na receita
  deviation: 1.2, // Acima do esperado
  alert: "Taxa de perda acima do esperado (+1.2pp)"
};

// Se desvio > 1%, agente envia alerta
if (kpis.deviation > 1.0) {
  await mcp.gmail.send({
    to: "gerente.producao@bemcasado.com.br",
    subject: "⚠️ Alerta: Taxa de perda acima do esperado",
    body: `OP-2024-001 está com taxa de perda de 3.2% (esperado: 2.0%)...`
  });
}
```

#### Etapa 8: Finalização e Relatório

```typescript
// Ao finalizar OP, agente gera relatório
const report = await agent.generateProductionReport('OP-2024-001');

// Salva no Notion
await mcp.notion.createPage({
  database: "Relatórios de Produção",
  title: "OP-2024-001 - Arroz Integral 1kg",
  properties: {
    "Data": "2024-12-14",
    "Produto": "Arroz Integral 1kg",
    "Quantidade Planejada": 600,
    "Quantidade Produzida": 585,
    "Taxa de Perda": "2.5%",
    "Custo Real": "R$ 4.180,00",
    "Duração Real": "7.5 horas",
    "Status": "Concluída"
  },
  content: `
    ## Resumo da Ordem de Produção
    
    A OP-2024-001 foi concluída com sucesso...
    
    ### Materiais Consumidos
    - Arroz em casca: 643 kg
    - Embalagem 1kg: 585 un
    
    ### Lotes Gerados
    - BC-2024-12-001: 585 un (Validade: 14/12/2025)
    
    ### Observações
    - Taxa de perda ligeiramente acima do esperado (2.5% vs 2.0%)
    - Causa: Embalagens rasgadas (lote defeituoso)
    - Ação: Trocar fornecedor de embalagens
  `
});
```

### Configuração do Agente

```typescript
// server/agents/productionAgent.ts

import { MCPClient } from '@manus/mcp-client';

export class ProductionAgent {
  private mcp: MCPClient;
  
  constructor() {
    this.mcp = new MCPClient({
      servers: {
        asana: { enabled: true },
        notion: { enabled: true },
        gmail: { enabled: true },
        calendar: { enabled: true }
      }
    });
  }
  
  async analyzeDemand(options: {
    period: number;
    minStockThreshold: number;
    forecastDays: number;
  }) {
    // Buscar dados de vendas e estoque
    const sales = await db.query(`
      SELECT 
        product_id,
        SUM(quantity) as total_sold,
        AVG(quantity) as avg_daily_sales
      FROM order_items
      WHERE created_at >= NOW() - INTERVAL '${options.period} days'
      GROUP BY product_id
    `);
    
    const stocks = await db.query(`
      SELECT 
        product_id,
        SUM(quantity) as current_stock,
        AVG(min_stock) as min_stock
      FROM product_stocks
      GROUP BY product_id
    `);
    
    // Identificar produtos em risco
    const productsAtRisk = stocks
      .filter(s => {
        const sale = sales.find(x => x.product_id === s.product_id);
        if (!sale) return false;
        
        const daysUntilStockout = s.current_stock / sale.avg_daily_sales;
        return daysUntilStockout < options.forecastDays;
      })
      .map(s => {
        const sale = sales.find(x => x.product_id === s.product_id);
        return {
          productId: s.product_id,
          currentStock: s.current_stock,
          minStock: s.min_stock,
          avgDailySales: sale.avg_daily_sales,
          daysUntilStockout: Math.floor(s.current_stock / sale.avg_daily_sales),
          priority: this.calculatePriority(s, sale)
        };
      })
      .sort((a, b) => b.priority - a.priority);
    
    return { productsAtRisk };
  }
  
  async suggestProductionOrders(productsAtRisk: any[]) {
    const suggestions = [];
    
    for (const product of productsAtRisk) {
      // Buscar receita do produto
      const recipe = await db.query(`
        SELECT * FROM production_recipes
        WHERE product_id = $1 AND active = true
        LIMIT 1
      `, [product.productId]);
      
      if (!recipe) continue;
      
      // Calcular quantidade a produzir
      const suggestedQuantity = this.calculateProductionQuantity(product);
      
      // Verificar materiais necessários
      const materialsNeeded = await this.checkMaterialsAvailability(
        recipe.id,
        suggestedQuantity
      );
      
      suggestions.push({
        productId: product.productId,
        suggestedQuantity,
        recipeId: recipe.id,
        materialsNeeded,
        materialsAvailable: materialsNeeded.every(m => m.available >= m.needed),
        priority: product.priority
      });
    }
    
    return { suggestions };
  }
  
  async createAsanaTask(suggestion: any) {
    return await this.mcp.asana.createTask({
      name: `OP: Produzir ${suggestion.suggestedQuantity} un de ${suggestion.productName}`,
      description: this.formatTaskDescription(suggestion),
      assignee: "gerente.producao@bemcasado.com.br",
      priority: suggestion.priority === "CRITICAL" ? "high" : "normal"
    });
  }
  
  async notifyManager(suggestion: any) {
    return await this.mcp.gmail.send({
      to: "gerente.producao@bemcasado.com.br",
      subject: this.formatEmailSubject(suggestion),
      body: this.formatEmailBody(suggestion)
    });
  }
  
  async generateProductionReport(orderNumber: string) {
    // Buscar dados da OP
    const order = await db.query(`
      SELECT * FROM production_orders WHERE order_number = $1
    `, [orderNumber]);
    
    // Buscar apontamentos
    const logs = await db.query(`
      SELECT * FROM production_logs WHERE production_order_id = $1
    `, [order.id]);
    
    // Calcular KPIs
    const kpis = this.calculateKPIs(order, logs);
    
    // Salvar no Notion
    await this.mcp.notion.createPage({
      database: "Relatórios de Produção",
      title: `${orderNumber} - ${order.product_name}`,
      properties: kpis,
      content: this.formatReportContent(order, logs, kpis)
    });
    
    return kpis;
  }
}
```

### Agendamento de Tarefas

```typescript
// server/scheduler.ts

import cron from 'node-cron';
import { ProductionAgent } from './agents/productionAgent';

const productionAgent = new ProductionAgent();

// Executar análise de demanda todos os dias às 06:00
cron.schedule('0 6 * * *', async () => {
  console.log('[CRON] Executando análise de demanda...');
  
  try {
    const analysis = await productionAgent.analyzeDemand({
      period: 30,
      minStockThreshold: 1.5,
      forecastDays: 15
    });
    
    if (analysis.productsAtRisk.length > 0) {
      const suggestions = await productionAgent.suggestProductionOrders(
        analysis.productsAtRisk
      );
      
      for (const suggestion of suggestions.suggestions) {
        await productionAgent.createAsanaTask(suggestion);
        await productionAgent.notifyManager(suggestion);
      }
      
      console.log(`[CRON] ${suggestions.suggestions.length} sugestões criadas`);
    } else {
      console.log('[CRON] Nenhum produto em risco');
    }
  } catch (error) {
    console.error('[CRON] Erro na análise de demanda:', error);
  }
});

// Gerar relatório de produção todos os dias às 18:00
cron.schedule('0 18 * * *', async () => {
  console.log('[CRON] Gerando relatórios de produção...');
  
  try {
    const completedOrders = await db.query(`
      SELECT order_number
      FROM production_orders
      WHERE status = 'completed'
        AND end_date::date = CURRENT_DATE
    `);
    
    for (const order of completedOrders) {
      await productionAgent.generateProductionReport(order.order_number);
    }
    
    console.log(`[CRON] ${completedOrders.length} relatórios gerados`);
  } catch (error) {
    console.error('[CRON] Erro ao gerar relatórios:', error);
  }
});
```

---

## 💼 Agente 2: Contabilidade (Accounting Agent)

### Objetivo e Escopo

O Agente de Contabilidade automatiza lançamentos contábeis, gera demonstrações contábeis (DRE, Balanço) e mantém a conformidade com princípios contábeis brasileiros (NBC TG). **Foco em conformidade contábil e demonstrações.**

### Responsabilidades Principais

**Lançamentos Automáticos**:
Para cada operação no sistema (venda, compra, produção, pagamento), o agente cria automaticamente os lançamentos contábeis correspondentes, respeitando o regime de competência e o método das partidas dobradas.

**Demonstrações Contábeis**:
Gera automaticamente DRE (Demonstração do Resultado do Exercício), Balanço Patrimonial e DMPL (Demonstração das Mutações do Patrimônio Líquido).

**Análise de Indicadores Contábeis**:
Calcula e monitora indicadores como margem bruta, margem líquida, ROE (Return on Equity), ROA (Return on Assets) e giro de estoque.

**Nota**: Fluxo de caixa, conciliação bancária e contas a pagar/receber são responsabilidades do **Agente Financeiro**.

### Ferramentas MCP Utilizadas

**Notion**:
- Manter plano de contas documentado
- Registrar políticas contábeis
- Criar base de conhecimento de lançamentos
- Documentar fechamentos mensais

**Gmail**:
- Enviar DRE e Balanço mensalmente
- Notificar sobre divergências na conciliação
- Alertar sobre indicadores fora do padrão
- Solicitar documentos faltantes

**Google Calendar**:
- Agendar fechamentos contábeis
- Marcar prazos de obrigações acessórias
- Programar reuniões de análise financeira

### Fluxo de Trabalho Detalhado

#### Lançamento Automático de Venda

```typescript
// Quando uma venda é finalizada
POST /api/orders/finalize
Body: {
  orderId: 123,
  storeId: 1,
  totalAmount: 5000, // R$ 50,00
  paymentMethod: "pix"
}

// Sistema dispara evento
event.emit('order.finalized', orderData);

// Agente contábil escuta evento
accountingAgent.on('order.finalized', async (order) => {
  // Buscar custo dos produtos vendidos
  const cmv = await calculateCMV(order.items);
  
  // Criar lançamento contábil
  const entry = await db.insert('accounting_entries').values({
    entry_number: `VND-${order.id}`,
    entry_date: new Date(),
    description: `Venda NFC-e ${order.nfce_key}`,
    source_module: 'sales',
    source_id: order.id,
    status: 'posted'
  }).returning();
  
  // Criar linhas do lançamento
  await db.insert('accounting_entry_lines').values([
    // Débito: Caixa
    {
      entry_id: entry.id,
      account_id: 1, // 1.1.01.001 - Caixa
      debit_amount: order.totalAmount,
      credit_amount: 0,
      description: 'Recebimento de venda'
    },
    // Crédito: Receita de Vendas
    {
      entry_id: entry.id,
      account_id: 50, // 3.1.01.001 - Receita de Vendas
      debit_amount: 0,
      credit_amount: order.totalAmount,
      description: 'Receita de venda de mercadorias'
    },
    // Débito: CMV
    {
      entry_id: entry.id,
      account_id: 60, // 4.1.01.001 - Custo das Mercadorias Vendidas
      debit_amount: cmv,
      credit_amount: 0,
      description: 'Baixa do custo das mercadorias vendidas'
    },
    // Crédito: Estoque
    {
      entry_id: entry.id,
      account_id: 10, // 1.1.03.001 - Estoque de Mercadorias
      debit_amount: 0,
      credit_amount: cmv,
      description: 'Baixa do estoque'
    }
  ]);
  
  console.log(`[CONTÁBIL] Lançamento VND-${order.id} criado automaticamente`);
});
```

#### Geração de DRE Mensal

```typescript
// Executado todo dia 1º do mês às 08:00
cron.schedule('0 8 1 * *', async () => {
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  const dre = await accountingAgent.generateDRE(lastMonth);
  
  // Salvar no Notion
  await mcp.notion.createPage({
    database: "Demonstrações Financeiras",
    title: `DRE - ${lastMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
    properties: {
      "Tipo": "DRE",
      "Período": lastMonth.toISOString().slice(0, 7),
      "Receita Bruta": dre.receitaBruta,
      "Lucro Líquido": dre.lucroLiquido,
      "Margem Líquida": `${dre.margemLiquida}%`
    },
    content: `
      # Demonstração do Resultado do Exercício
      ## ${lastMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
      
      ### Receitas
      - Receita Bruta de Vendas: ${formatCurrency(dre.receitaBruta)}
      - (-) Deduções e Abatimentos: ${formatCurrency(dre.deducoes)}
      - **Receita Líquida**: ${formatCurrency(dre.receitaLiquida)}
      
      ### Custos
      - (-) Custo das Mercadorias Vendidas: ${formatCurrency(dre.cmv)}
      - **Lucro Bruto**: ${formatCurrency(dre.lucroBruto)}
      - **Margem Bruta**: ${dre.margemBruta}%
      
      ### Despesas Operacionais
      - (-) Despesas Administrativas: ${formatCurrency(dre.despesasAdm)}
      - (-) Despesas Comerciais: ${formatCurrency(dre.despesasCom)}
      - **Lucro Operacional**: ${formatCurrency(dre.lucroOperacional)}
      
      ### Resultado Financeiro
      - (+) Receitas Financeiras: ${formatCurrency(dre.receitasFinanceiras)}
      - (-) Despesas Financeiras: ${formatCurrency(dre.despesasFinanceiras)}
      - **Resultado Financeiro**: ${formatCurrency(dre.resultadoFinanceiro)}
      
      ### Resultado Antes dos Impostos
      - **LAIR**: ${formatCurrency(dre.lair)}
      
      ### Impostos
      - (-) IRPJ: ${formatCurrency(dre.irpj)}
      - (-) CSLL: ${formatCurrency(dre.csll)}
      
      ### Resultado Final
      - **Lucro Líquido**: ${formatCurrency(dre.lucroLiquido)}
      - **Margem Líquida**: ${dre.margemLiquida}%
      
      ---
      
      ## Análise
      
      ${dre.margemLiquida > 10 ? '✅' : '⚠️'} A margem líquida de ${dre.margemLiquida}% está ${dre.margemLiquida > 10 ? 'dentro' : 'abaixo'} do esperado (meta: 10%).
      
      ${dre.lucroBruto > dre.lucroLiquido * 2 ? '✅' : '⚠️'} O lucro bruto representa ${((dre.lucroBruto / dre.receitaLiquida) * 100).toFixed(1)}% da receita líquida.
    `
  });
  
  // Enviar por email
  await mcp.gmail.send({
    to: "diretoria@bemcasado.com.br",
    subject: `DRE - ${lastMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
    body: `
      Segue em anexo a DRE do mês de ${lastMonth.toLocaleDateString('pt-BR', { month: 'long' })}.
      
      Destaques:
      - Receita Líquida: ${formatCurrency(dre.receitaLiquida)}
      - Lucro Líquido: ${formatCurrency(dre.lucroLiquido)}
      - Margem Líquida: ${dre.margemLiquida}%
      
      Documento completo disponível no Notion.
    `
  });
});
```

---

## 💰 Agente 3: Financeiro (Financial Agent)

### Objetivo e Escopo

O Agente Financeiro é responsável pela gestão completa do fluxo de caixa, contas a pagar e receber, conciliação bancária e análise de indicadores de liquidez. **Foco em gestão de caixa e operações financeiras.**

### Responsabilidades Principais

**Gestão de Fluxo de Caixa**:
Monitora saldo de caixa e bancos em tempo real, projeta entradas e saídas para os próximos 7, 15 e 30 dias, e alerta sobre saldo baixo ou concentração de pagamentos.

**Contas a Pagar**:
Gerencia vencimentos de fornecedores, prioriza pagamentos, negocia prazos e calcula multas e juros.

**Contas a Receber**:
Controla inadimplência, envia cobranças automáticas, calcula juros de atraso e sugere descontos para antecipação.

**Conciliação Bancária**:
Importa extratos bancários (OFX, API), concilia automaticamente com lançamentos e identifica divergências.

**Análise de Indicadores Financeiros**:
Calcula liquidez corrente, liquidez seca, prazo médio de recebimento/pagamento, ciclo operacional e ciclo financeiro.

### Ferramentas MCP Utilizadas

**Gmail**:
- Enviar alertas de vencimentos
- Notificar sobre saldo baixo
- Enviar cobranças automáticas
- Relatórios financeiros semanais

**Notion**:
- Documentar políticas financeiras
- Manter calendário de pagamentos
- Registrar negociações com fornecedores

**Google Calendar**:
- Agendar pagamentos
- Marcar vencimentos
- Programar conciliações bancárias

### Rotinas Automatizadas

**Diária (08:00)**:
- Atualizar saldo de caixa
- Verificar vencimentos do dia
- Calcular projeção de saldo (7 dias)
- Enviar resumo ao gerente financeiro

**Semanal (Segunda 09:00)**:
- Conciliação bancária
- Análise de inadimplência
- Projeção de fluxo de caixa (30 dias)
- Relatório semanal

**Mensal (Dia 1º 10:00)**:
- Demonstração de Fluxo de Caixa (DFC)
- Análise de capital de giro
- Indicadores financeiros
- Relatório gerencial

---

## 📊 Agente 4: Fiscal (Tax Agent)

### Objetivo e Escopo

O Agente Fiscal garante conformidade tributária, calcula impostos automaticamente e gera obrigações acessórias (SPED).

### Responsabilidades Principais

**Cálculo de Impostos**:
Para cada operação (venda, compra, transferência), o agente calcula automaticamente ICMS, IPI, PIS, COFINS e ISS, considerando a legislação específica de cada estado e município.

**Apuração de ICMS**:
Consolida todas as operações do mês por estado, calcula o ICMS a recolher considerando créditos e débitos, e gera as guias DARE para pagamento.

**Apuração de Impostos Federais**:
Calcula PIS e COFINS sobre o faturamento consolidado da matriz, considerando o regime tributário (Simples Nacional, Lucro Presumido ou Lucro Real).

**Geração de SPED**:
Gera automaticamente os arquivos SPED Fiscal (ICMS/IPI) e SPED Contribuições (PIS/COFINS) no formato exigido pela Receita Federal.

**Identificação de Benefícios Fiscais**:
Analisa operações e sugere enquadramentos que reduzam a carga tributária de forma legal, como substituição tributária, diferimento e isenções.

### Ferramentas MCP Utilizadas

**Notion**:
- Manter calendário de obrigações fiscais
- Documentar benefícios fiscais aplicáveis
- Registrar histórico de apurações
- Criar base de conhecimento tributário

**Gmail**:
- Alertar sobre prazos de entrega de SPED
- Notificar sobre guias a pagar
- Enviar resumo mensal de impostos
- Solicitar documentos para auditoria

**Google Calendar**:
- Agendar entregas de obrigações acessórias
- Marcar vencimentos de guias
- Programar auditorias fiscais internas

### Fluxo de Trabalho Detalhado

#### Cálculo Automático de ICMS em Venda

```typescript
// Quando uma venda é processada
const sale = {
  storeId: 2, // Filial RJ
  customerState: "RJ", // Cliente no RJ
  totalAmount: 10000, // R$ 100,00
  items: [
    { productId: 1, quantity: 2, unitPrice: 5000 }
  ]
};

// Agente fiscal calcula ICMS
const taxCalculation = await taxAgent.calculateTaxes(sale);

// Resultado:
{
  icms: {
    base: 10000, // Base de cálculo = valor total
    rate: 18, // Alíquota RJ para RJ
    amount: 1800, // R$ 18,00
    cst: "000", // Tributado integralmente
    cfop: "5102" // Venda de mercadoria adquirida de terceiros
  },
  pis: {
    base: 10000,
    rate: 0.65,
    amount: 65
  },
  cofins: {
    base: 10000,
    rate: 3.0,
    amount: 300
  },
  totalTaxes: 2165 // R$ 21,65
}

// Registrar no livro fiscal
await db.insert('fiscal_book').values({
  store_id: sale.storeId,
  document_type: 'nfce',
  document_key: sale.nfce_key,
  document_date: new Date(),
  operation_type: 'saida',
  cfop: taxCalculation.icms.cfop,
  total_amount: sale.totalAmount,
  icms_base: taxCalculation.icms.base,
  icms_amount: taxCalculation.icms.amount,
  pis_amount: taxCalculation.pis.amount,
  cofins_amount: taxCalculation.cofins.amount
});
```

#### Apuração Mensal de ICMS

```typescript
// Executado todo dia 1º do mês
cron.schedule('0 9 1 * *', async () => {
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  // Para cada filial
  const stores = await db.select().from('stores').where({ active: 1 });
  
  for (const store of stores) {
    const apportionment = await taxAgent.calculateICMSApportionment(
      store.id,
      lastMonth
    );
    
    // Salvar apuração
    await db.insert('icms_apportionment').values({
      store_id: store.id,
      state: store.state,
      reference_month: lastMonth,
      total_sales: apportionment.totalSales,
      icms_base: apportionment.icmsBase,
      icms_amount: apportionment.icmsAmount,
      status: 'open',
      due_date: new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 10)
    });
    
    // Gerar guia DARE
    const dare = await taxAgent.generateDARE(apportionment);
    
    // Notificar contador
    await mcp.gmail.send({
      to: "contador@bemcasado.com.br",
      subject: `ICMS a Recolher - ${store.name} - ${lastMonth.toLocaleDateString('pt-BR', { month: 'long' })}`,
      body: `
        Apuração de ICMS concluída para ${store.name}.
        
        Resumo:
        - Total de vendas: ${formatCurrency(apportionment.totalSales)}
        - Base de cálculo: ${formatCurrency(apportionment.icmsBase)}
        - ICMS a recolher: ${formatCurrency(apportionment.icmsAmount)}
        - Vencimento: 10/${lastMonth.getMonth() + 2}/${lastMonth.getFullYear()}
        
        Guia DARE em anexo.
      `,
      attachments: [dare.pdfPath]
    });
  }
});
```

#### Geração de SPED Fiscal

```typescript
// Executado todo dia 10 do mês
cron.schedule('0 10 10 * *', async () => {
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  for (const store of stores) {
    const sped = await taxAgent.generateSPEDFiscal(store.id, lastMonth);
    
    // Salvar arquivo
    const filePath = `/tmp/SPED_FISCAL_${store.cnpj}_${lastMonth.toISOString().slice(0, 7)}.txt`;
    await fs.writeFile(filePath, sped.content);
    
    // Documentar no Notion
    await mcp.notion.createPage({
      database: "Obrigações Fiscais",
      title: `SPED Fiscal - ${store.name} - ${lastMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
      properties: {
        "Tipo": "SPED Fiscal",
        "CNPJ": store.cnpj,
        "Período": lastMonth.toISOString().slice(0, 7),
        "Status": "Gerado",
        "Prazo": new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 20).toISOString()
      },
      content: `
        # SPED Fiscal
        
        ## Informações
        - **Estabelecimento**: ${store.name}
        - **CNPJ**: ${store.cnpj}
        - **Período**: ${lastMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        
        ## Estatísticas
        - Registros C100 (NF-e Saída): ${sped.stats.c100}
        - Registros C170 (Itens): ${sped.stats.c170}
        - Total de ICMS: ${formatCurrency(sped.stats.totalICMS)}
        
        ## Arquivo
        - Nome: SPED_FISCAL_${store.cnpj}_${lastMonth.toISOString().slice(0, 7)}.txt
        - Tamanho: ${sped.stats.fileSize} KB
        
        ## Próximos Passos
        1. Validar arquivo no PVA da SEFAZ
        2. Transmitir até dia 20
        3. Guardar recibo de entrega
      `
    });
    
    // Alertar contador
    await mcp.gmail.send({
      to: "contador@bemcasado.com.br",
      subject: `SPED Fiscal Gerado - ${store.name}`,
      body: `
        O SPED Fiscal de ${lastMonth.toLocaleDateString('pt-BR', { month: 'long' })} foi gerado.
        
        Arquivo disponível no servidor.
        Prazo de entrega: 20/${lastMonth.getMonth() + 2}/${lastMonth.getFullYear()}
      `,
      attachments: [filePath]
    });
  }
});
```

---

## 🔧 Configuração Técnica

### Instalação de Dependências

```bash
# Instalar MCP Client
pnpm add @manus/mcp-client

# Instalar bibliotecas auxiliares
pnpm add node-cron date-fns
```

### Configuração de Servidores MCP

```typescript
// server/config/mcp.ts

export const mcpConfig = {
  servers: {
    asana: {
      enabled: true,
      workspace: process.env.ASANA_WORKSPACE_ID,
      defaultProject: process.env.ASANA_DEFAULT_PROJECT
    },
    notion: {
      enabled: true,
      databases: {
        production_reports: process.env.NOTION_DB_PRODUCTION,
        financial_statements: process.env.NOTION_DB_FINANCIAL,
        tax_obligations: process.env.NOTION_DB_TAX
      }
    },
    gmail: {
      enabled: true,
      from: "sistema@bemcasado.com.br"
    },
    calendar: {
      enabled: true,
      calendarId: process.env.GOOGLE_CALENDAR_ID
    }
  }
};
```

### Variáveis de Ambiente

```bash
# .env

# MCP Servers
ASANA_WORKSPACE_ID=123456789
ASANA_DEFAULT_PROJECT=987654321
NOTION_DB_PRODUCTION=abc123
NOTION_DB_FINANCIAL=def456
NOTION_DB_TAX=ghi789
GOOGLE_CALENDAR_ID=primary

# Emails
PRODUCTION_MANAGER_EMAIL=gerente.producao@bemcasado.com.br
ACCOUNTING_EMAIL=contador@bemcasado.com.br
DIRECTOR_EMAIL=diretoria@bemcasado.com.br
```

---

## 📈 Métricas de Sucesso

### KPIs dos Agentes

**Agente de Relatórios Diários**:
- Taxa de entrega no horário (meta: 100%)
- Taxa de abertura do email (meta: >90%)
- Tempo de geração do relatório (meta: <5 minutos)
- Satisfação dos gestores (meta: >4.5/5)

**Agente de Produção**:
- Taxa de acerto nas previsões de demanda (meta: >85%)
- Redução de rupturas de estoque (meta: -50%)
- Aumento de OEE (meta: +15%)
- Redução de perdas na produção (meta: -20%)

**Agente de Contabilidade**:
- Redução de tempo de fechamento contábil (meta: -70%)
- Taxa de erro em lançamentos (meta: <1%)
- Tempo de geração de DRE (meta: <5 minutos)
- Satisfação do contador (meta: >4.5/5)

**Agente Fiscal**:
- Taxa de acerto no cálculo de impostos (meta: 100%)
- Redução de multas fiscais (meta: -100%)
- Tempo de geração de SPED (meta: <10 minutos)
- Identificação de benefícios fiscais (meta: >R$ 50k/ano)

---

## 📧 Agente 5: Relatórios Diários (Coordenador Interno)

### Objetivo e Escopo

O **Agente de Relatórios Diários** é um agente coordenador que compila informações dos outros quatro agentes (Produção, Contabilidade, Financeiro, Fiscal) e adiciona dados de vendas e estoque, enviando um **email executivo consolidado** todos os dias às 07:00. **Foco em dados internos da operação.**

### Responsabilidades Principais

**Compilação de Dados**:
Coleta informações de todas as áreas do ERP e compila em um único relatório executivo.

**Coordenação de Agentes**:
Interage com os outros três agentes para obter análises e recomendações.

**Envio Automático**:
Envia email formatado para diretoria e gerentes todos os dias antes do expediente.

**Documentação**:
Salva cópia do relatório no Notion para histórico e auditoria.

### Estrutura do Relatório

O relatório diário contém **8 seções principais**:

1. **Resumo Executivo**: Faturamento, pedidos, meta diária, comparativos
2. **Vendas por Filial**: Performance de cada loja, produtos mais vendidos
3. **Estoque e Alertas**: Produtos críticos, valor imobilizado
4. **Produção**: Ordens concluídas, em andamento, KPIs (do Agente de Produção)
5. **Financeiro**: Fluxo de caixa, contas a pagar/receber, saldo projetado (do Agente Financeiro)
6. **Contabilidade**: DRE parcial, indicadores contábeis (do Agente de Contabilidade)
7. **Fiscal**: Impostos apurados por filial, obrigações pendentes (do Agente Fiscal)
8. **Alertas Críticos**: Ações urgentes recomendadas
9. **Tendências**: Comparativos semanais e mensais

### Ferramentas MCP Utilizadas

**Gmail**:
- Enviar relatório diário formatado em HTML
- Múltiplos destinatários (diretoria, gerentes)

**Notion**:
- Salvar cópia do relatório para histórico
- Criar base de conhecimento de decisões

### Exemplo de Relatório

```
🏭 BEM CASADO - RELATÓRIO EXECUTIVO DIÁRIO
📅 Sexta-feira, 13 de Dezembro de 2024

💰 RESUMO EXECUTIVO
• Faturamento: R$ 45.230,00 (+12% vs ontem)
• Pedidos: 127 pedidos
• Meta Diária: 95% atingido

🏪 VENDAS POR FILIAL
• Matriz SP: R$ 18.920,00 (42%)
• Filial RJ: R$ 15.430,00 (34%)
• Filial BH: R$ 10.880,00 (24%)

⚠️ ALERTAS CRÍTICOS
1. Arroz Integral: Estoque crítico (45 un)
2. SPED Fiscal: Vence em 2 dias
3. Pagamentos: R$ 83k concentrados dia 18/12

💡 OPORTUNIDADES
1. Feijão Preto: Vendas +35% (aumentar produção)
2. Filial BH: Ticket médio R$ 403 (replicar estratégia)
```

### Destinatários

- Diretoria
- Gerente Geral
- Gerente de Produção
- Gerente Financeiro
- Contador
- Gerentes de Filial (opcional)

### Benefícios

**Para a Diretoria**:
- Visão consolidada do negócio em um único email
- Tomada de decisão rápida sem acessar sistemas
- Identificação de tendências e oportunidades

**Para Gerentes**:
- Alertas proativos sobre problemas críticos
- Comparativos de performance entre filiais
- Ações recomendadas pelo sistema

**Para o Contador**:
- Resumo fiscal diário
- Alertas de prazos de obrigações
- Fluxo de caixa consolidado

---

## 🎯 Conclusão

## 📰 Agente 6: Monitoramento de Notícias (Inteligência de Mercado)

### Objetivo e Escopo

O **Agente de Monitoramento de Notícias** coleta, filtra e analisa notícias relevantes sobre o agronegócio, focando em arroz, feijão, legislação, cotações e clima. **Foco em dados externos do mercado.**

### Responsabilidades Principais

**Monitoramento de Fontes**:
Coleta notícias de portais especializados (Globo Rural, Canal Rural, AgroLink), órgãos oficiais (DOU, CONAB, MAPA) e mercado internacional (USDA, FAO).

**Cotações e Indicadores**:
Coleta preços de arroz e feijão (CEPEA, B3), dólar e indicadores de mercado.

**Clima e Safras**:
Monitora previsões do INMET e CPTEC para regiões produtoras (RS, SC, PR).

**Legislação**:
Busca no Diário Oficial da União (DOU) por novas normas que impactam o setor.

**Análise e Insights**:
Identifica oportunidades, riscos e tendências de mercado.

### Ferramentas MCP Utilizadas

**Gmail**:
- Enviar relatório diário às 08:00
- Destinatário: diretoria@arrozbemcasado.com.br

**Notion**:
- Salvar histórico de notícias
- Criar base de conhecimento de mercado

**Google Calendar** (Opcional):
- Marcar eventos importantes (relatórios CONAB, USDA)

### Rotinas Automatizadas

**Diária (08:00)**:
- Coletar notícias de todas as fontes
- Filtrar e classificar por relevância
- Coletar cotações e clima
- Verificar DOU
- Gerar análise e insights
- Enviar relatório por email

### Estrutura do Relatório

O relatório diário contém **7 seções principais**:

1. **Destaques do Dia**: Notícias de alto impacto
2. **Cotações**: Preços de arroz, feijão, dólar
3. **Clima e Safras**: Previsões e andamento
4. **Legislação**: Novas normas do DOU
5. **Mercado Internacional**: USDA, China, Argentina
6. **Tecnologia**: Inovações no agronegócio
7. **Análise Estratégica**: Oportunidades, riscos, tendências

### Benefícios

**Para a Diretoria**:
- Inteligência de mercado compilada
- Economia de tempo (não busca notícias manualmente)
- Decisões informadas sobre estratégia
- Antecipação de riscos e oportunidades

**Para o Negócio**:
- Competitividade (reação rápida a mudanças)
- Redução de riscos (clima, legislação)
- Identificação de janelas de venda
- Acompanhamento de inovações

---

## 🎯 Conclusão

A integração dos **seis agentes MCP especializados** (Produção, Contabilidade, Financeiro, Fiscal, Relatórios Diários e Monitoramento de Notícias) transforma o ERP Bem Casado em um sistema inteligente e autônomo, capaz de tomar decisões operacionais com mínima intervenção humana. Os agentes atuam como especialistas virtuais, automatizando tarefas complexas, garantindo conformidade e liberando a equipe para focar em atividades estratégicas.

A arquitetura proposta é escalável, modular e facilmente extensível, permitindo a adição de novos agentes conforme o negócio cresce. A integração com ferramentas MCP (Asana, Notion, Gmail, Calendar) garante que todas as ações dos agentes sejam documentadas, rastreáveis e auditáveis.

---

**Documento preparado por**: Equipe de Arquitetura Bem Casado  
**Data**: Dezembro 2024  
**Versão**: 1.0
