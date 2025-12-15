# 🏭 Arquitetura de Evolução: PDV/Loja Online → ERP Industrial Completo

## 📋 Sumário Executivo

Este documento apresenta a arquitetura de evolução do sistema **Bem Casado** desde sua implementação atual como **PDV/Loja Online** até um **ERP Industrial Completo**, integrando fabricação, distribuição, contabilidade e gestão fiscal multi-estadual. A arquitetura foi projetada para **aproveitar 100% da base já desenvolvida**, adicionando módulos de forma incremental e não-destrutiva.

### Visão Geral da Evolução

O sistema evoluirá em **três camadas principais**, mantendo compatibilidade total com a infraestrutura existente:

**Camada 1 - ATUAL**: PDV + Loja Online (✅ Implementado)
- Gestão de vendas no varejo
- Controle de estoque por filial
- Emissão de NF-e de venda
- Sistema multi-filial

**Camada 2 - PRÓXIMA**: Distribuição + Logística (🔄 Em planejamento)
- Gestão de fornecedores externos
- Importação de NF-e de compra
- Transferências entre filiais
- Ajustes de estoque com auditoria

**Camada 3 - FUTURA**: Indústria + ERP Completo (🎯 Roadmap)
- Manufatura e produção
- Gestão de matéria-prima
- Ordens de produção
- Contabilidade integrada
- Gestão fiscal federal e estadual
- **Integração com Agentes MCP**

---

## 🎯 Arquitetura Modular Proposta

### Princípios Fundamentais

A arquitetura segue cinco princípios essenciais para garantir escalabilidade e manutenibilidade:

**1. Modularidade**: Cada módulo opera de forma independente, mas integrada através de interfaces bem definidas. Novos módulos podem ser adicionados sem modificar os existentes.

**2. Reaproveitamento**: Toda a infraestrutura atual (banco de dados, autenticação, gestão de estoque, NF-e) será reutilizada. Não há necessidade de reescrever código funcional.

**3. Separação de Responsabilidades**: Cada módulo tem responsabilidades claras e bem delimitadas, evitando acoplamento desnecessário entre componentes.

**4. Escalabilidade Horizontal**: O sistema suporta crescimento através da adição de novas filiais, linhas de produção e unidades de negócio sem degradação de performance.

**5. Integração via Agentes**: Processos complexos (contabilidade, fiscal, produção) são gerenciados por agentes MCP especializados, permitindo automação inteligente e auditoria completa.

---

## 🏗️ Estrutura de Módulos

### Módulo 1: VAREJO (✅ Implementado)

Este módulo já está completamente operacional e serve como base para todos os demais.

**Responsabilidades**:
- Gestão de vendas no PDV e loja online
- Controle de estoque por filial
- Emissão de NF-e de venda (NFC-e)
- Gestão de clientes e cupons de desconto
- Relatórios de vendas e movimentações

**Tabelas Principais**:
- `stores` - Cadastro de filiais
- `products` - Catálogo de produtos
- `productStocks` - Estoque por filial
- `orders` - Pedidos e vendas
- `stockMovements` - Movimentações de estoque
- `nfce` - Notas fiscais de venda

**Integrações Externas**:
- Focus NF-e (emissão de NFC-e)
- Gateways de pagamento (PIX, cartão)
- Google Maps (localização de lojas)

---

### Módulo 2: DISTRIBUIÇÃO (🔄 Parcialmente Implementado)

Este módulo gerencia a cadeia de suprimentos, desde fornecedores externos até as filiais.

**Responsabilidades**:
- Gestão de fornecedores e compras
- Importação de XML de NF-e de entrada
- Cálculo de custo médio ponderado
- Transferências entre filiais
- Ajustes manuais de estoque com auditoria

**Tabelas Principais** (já existentes):
- `suppliers` - Cadastro de fornecedores
- `stockMovements` - Movimentações (entrada, saída, ajuste, transferência)
- `stockBatches` - Lotes de estoque (PEPS/FIFO)

**Funcionalidades Implementadas**:
- ✅ Importação de XML de NF-e
- ✅ Cálculo automático de custo médio
- ✅ Ajustes manuais com 10 motivos diferentes
- ✅ Histórico completo de auditoria

**Funcionalidades Pendentes**:
- 🔄 Gestão de pedidos de compra
- 🔄 Aprovação de fornecedores
- 🔄 Controle de qualidade na entrada
- 🔄 Rastreamento de lotes e validade

---

### Módulo 3: INDÚSTRIA/MANUFATURA (🎯 A Implementar)

Este é o módulo central do ERP Industrial, responsável pela gestão completa da produção.

**Responsabilidades**:
- Gestão de matérias-primas e insumos
- Ordens de produção (OP)
- Controle de linhas de produção
- Apontamento de produção em tempo real
- Gestão de perdas e refugos
- Cálculo de custo de produção
- Rastreabilidade de lotes

**Novas Tabelas Necessárias**:

```sql
-- Matérias-primas e insumos
CREATE TABLE raw_materials (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  unit VARCHAR(20) NOT NULL, -- kg, ton, L, etc
  current_stock DECIMAL(10,3) DEFAULT 0,
  min_stock DECIMAL(10,3),
  average_cost INTEGER, -- em centavos
  supplier_id INTEGER REFERENCES suppliers(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Receitas de produção (BOM - Bill of Materials)
CREATE TABLE production_recipes (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id), -- Produto final
  name VARCHAR(255) NOT NULL, -- Ex: "Arroz Integral 1kg - Padrão"
  version INTEGER DEFAULT 1,
  yield_quantity DECIMAL(10,3), -- Quantidade produzida por lote
  yield_unit VARCHAR(20), -- un, kg, L
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ingredientes da receita
CREATE TABLE recipe_ingredients (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER REFERENCES production_recipes(id),
  raw_material_id INTEGER REFERENCES raw_materials(id),
  quantity DECIMAL(10,3) NOT NULL, -- Quantidade necessária
  unit VARCHAR(20) NOT NULL,
  loss_percentage DECIMAL(5,2) DEFAULT 0, -- % de perda esperada
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ordens de produção
CREATE TABLE production_orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL, -- OP-2024-001
  recipe_id INTEGER REFERENCES production_recipes(id),
  product_id INTEGER REFERENCES products(id),
  planned_quantity DECIMAL(10,3) NOT NULL,
  produced_quantity DECIMAL(10,3) DEFAULT 0,
  status VARCHAR(20) NOT NULL, -- planned, in_progress, completed, cancelled
  production_line VARCHAR(100), -- Linha de produção
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  responsible_user_id INTEGER REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Apontamentos de produção
CREATE TABLE production_logs (
  id SERIAL PRIMARY KEY,
  production_order_id INTEGER REFERENCES production_orders(id),
  quantity_produced DECIMAL(10,3) NOT NULL,
  quantity_loss DECIMAL(10,3) DEFAULT 0, -- Perdas/refugos
  loss_reason VARCHAR(255),
  batch_number VARCHAR(50), -- Lote produzido
  expiry_date DATE, -- Data de validade
  user_id INTEGER REFERENCES users(id),
  logged_at TIMESTAMP DEFAULT NOW()
);

-- Consumo de matéria-prima
CREATE TABLE material_consumption (
  id SERIAL PRIMARY KEY,
  production_order_id INTEGER REFERENCES production_orders(id),
  raw_material_id INTEGER REFERENCES raw_materials(id),
  quantity_consumed DECIMAL(10,3) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  cost_per_unit INTEGER, -- Custo em centavos
  total_cost INTEGER, -- Custo total em centavos
  consumed_at TIMESTAMP DEFAULT NOW()
);
```

**Fluxo de Produção**:

1. **Planejamento**: Criar ordem de produção baseada em demanda
2. **Reserva de Materiais**: Reservar matérias-primas necessárias
3. **Início da Produção**: Iniciar OP e consumir materiais
4. **Apontamento**: Registrar produção em tempo real
5. **Finalização**: Gerar lotes de produto acabado
6. **Entrada no Estoque**: Adicionar produtos ao estoque de distribuição

**Integração com Agente MCP de Produção**:

O agente MCP será responsável por:
- Sugerir ordens de produção baseadas em estoque baixo
- Otimizar sequenciamento de produção
- Calcular custos de produção em tempo real
- Alertar sobre desvios de receita
- Gerar relatórios de eficiência (OEE)

---

### Módulo 4: CONTABILIDADE (🎯 A Implementar)

Este módulo gerencia a contabilidade formal da empresa, focando em **conformidade contábil e demonstrações**. Opera em **regime de competência**.

**Nota**: Gestão de caixa, contas a pagar/receber e conciliação bancária são responsabilidades do **Módulo 5: FINANCEIRO**.

Este módulo gerencia toda a contabilidade da empresa, integrando-se com os demais módulos.

**Responsabilidades**:
- Plano de contas contábil
- Lançamentos contábeis automáticos
- Demonstrações contábeis (DRE, Balanço, DMPL)
- Análise de indicadores contábeis (ROE, ROA, margens)
- Auditoria e conformidade NBC TG

**Novas Tabelas Necessárias**:

```sql
-- Plano de contas
CREATE TABLE chart_of_accounts (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL, -- 1.1.01.001
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL, -- asset, liability, equity, revenue, expense
  parent_id INTEGER REFERENCES chart_of_accounts(id),
  level INTEGER NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Lançamentos contábeis
CREATE TABLE accounting_entries (
  id SERIAL PRIMARY KEY,
  entry_number VARCHAR(50) UNIQUE NOT NULL,
  entry_date DATE NOT NULL,
  description TEXT NOT NULL,
  source_module VARCHAR(50), -- sales, purchases, production, manual
  source_id INTEGER, -- ID do registro origem
  user_id INTEGER REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'draft', -- draft, posted, reversed
  created_at TIMESTAMP DEFAULT NOW()
);

-- Linhas do lançamento (débito e crédito)
CREATE TABLE accounting_entry_lines (
  id SERIAL PRIMARY KEY,
  entry_id INTEGER REFERENCES accounting_entries(id),
  account_id INTEGER REFERENCES chart_of_accounts(id),
  debit_amount INTEGER DEFAULT 0, -- em centavos
  credit_amount INTEGER DEFAULT 0, -- em centavos
  description TEXT,
  cost_center VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Contas a pagar
CREATE TABLE accounts_payable (
  id SERIAL PRIMARY KEY,
  supplier_id INTEGER REFERENCES suppliers(id),
  invoice_number VARCHAR(100),
  nfe_key VARCHAR(44), -- Chave da NF-e
  due_date DATE NOT NULL,
  amount INTEGER NOT NULL, -- em centavos
  paid_amount INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending', -- pending, partial, paid, overdue
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Contas a receber
CREATE TABLE accounts_receivable (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER,
  order_id INTEGER REFERENCES orders(id),
  nfce_key VARCHAR(44),
  due_date DATE NOT NULL,
  amount INTEGER NOT NULL,
  received_amount INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Lançamentos Automáticos**:

O sistema gerará lançamentos contábeis automaticamente para:

- **Vendas**: Débito em Caixa/Banco, Crédito em Receita de Vendas
- **Compras**: Débito em Estoque, Crédito em Fornecedores
- **Produção**: Débito em Estoque de Produtos Acabados, Crédito em Estoque de Matéria-Prima
- **Pagamentos**: Débito em Fornecedores, Crédito em Caixa/Banco
- **Recebimentos**: Débito em Caixa/Banco, Crédito em Clientes

**Integração com Agente MCP de Contabilidade**:

O agente MCP será responsável por:
- Validar lançamentos contábeis
- Sugerir classificações contábeis
- Gerar demonstrações contábeis (DRE, Balanço)
- Calcular indicadores contábeis (ROE, ROA, margens)
- Alertar sobre inconsistências
- Preparar documentos para auditoria

---

### Módulo 5: FINANCEIRO (🎯 A Implementar)

Este módulo gerencia o fluxo de caixa e operações financeiras, focando em **liquidez e solvabilidade**. Opera em **regime de caixa**.

**Responsabilidades**:
- Gestão de fluxo de caixa
- Contas a pagar e receber
- Conciliação bancária
- Projeção de caixa (7, 15, 30 dias)
- Análise de indicadores de liquidez
- Gestão de inadimplência

**Novas Tabelas Necessárias**:

```sql
-- Contas bancárias
CREATE TABLE bank_accounts (
  id SERIAL PRIMARY KEY,
  account_type VARCHAR(20) NOT NULL, -- cash, bank
  bank_name VARCHAR(100),
  account_number VARCHAR(50),
  balance INTEGER NOT NULL DEFAULT 0, -- em centavos
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Movimentações financeiras
CREATE TABLE financial_transactions (
  id SERIAL PRIMARY KEY,
  account_id INTEGER REFERENCES bank_accounts(id),
  transaction_type VARCHAR(20) NOT NULL, -- inflow, outflow
  amount INTEGER NOT NULL, -- em centavos
  description TEXT,
  reference_type VARCHAR(50), -- order, payment, receipt
  reference_id INTEGER,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Projeção de fluxo de caixa
CREATE TABLE cash_flow_projection (
  id SERIAL PRIMARY KEY,
  projection_date DATE NOT NULL,
  expected_inflows INTEGER, -- em centavos
  expected_outflows INTEGER,
  projected_balance INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Integração com Agente MCP Financeiro**:

O agente MCP será responsável por:
- Monitorar saldo de caixa em tempo real
- Projetar fluxo de caixa (7, 15, 30 dias)
- Alertar sobre saldo baixo ou concentração de pagamentos
- Enviar cobranças automáticas de clientes inadimplentes
- Sugerir negociações com fornecedores
- Calcular indicadores de liquidez (corrente, seca)
- Gerar Demonstração de Fluxo de Caixa (DFC)

---

### Módulo 6: FISCAL (🎯 A Implementar)

Este é o módulo mais complexo, responsável pela gestão de todos os tributos federais e estaduais.

**Responsabilidades**:
- Cálculo de impostos (ICMS, IPI, PIS, COFINS, ISS)
- Apuração de ICMS por estado
- Apuração de impostos federais (centralizados na matriz)
- Geração de SPED Fiscal
- Geração de SPED Contribuições
- Geração de SINTEGRA
- Controle de substituição tributária (ICMS-ST)
- Gestão de benefícios fiscais

**Novas Tabelas Necessárias**:

```sql
-- Regras tributárias por produto e estado
CREATE TABLE tax_rules (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  state_from VARCHAR(2), -- UF de origem
  state_to VARCHAR(2), -- UF de destino
  cfop VARCHAR(4) NOT NULL, -- Código Fiscal de Operações
  icms_rate DECIMAL(5,2), -- % ICMS
  icms_st_rate DECIMAL(5,2), -- % ICMS-ST
  ipi_rate DECIMAL(5,2), -- % IPI
  pis_rate DECIMAL(5,2), -- % PIS
  cofins_rate DECIMAL(5,2), -- % COFINS
  cst_icms VARCHAR(3), -- Código de Situação Tributária
  cst_pis VARCHAR(2),
  cst_cofins VARCHAR(2),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Apuração de ICMS por estado
CREATE TABLE icms_apportionment (
  id SERIAL PRIMARY KEY,
  store_id INTEGER REFERENCES stores(id),
  state VARCHAR(2) NOT NULL,
  reference_month DATE NOT NULL, -- Mês de referência
  total_sales INTEGER, -- Vendas totais em centavos
  icms_base INTEGER, -- Base de cálculo
  icms_amount INTEGER, -- ICMS a recolher
  icms_st_amount INTEGER, -- ICMS-ST a recolher
  status VARCHAR(20) DEFAULT 'open', -- open, closed, paid
  due_date DATE,
  payment_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Apuração de impostos federais (PIS/COFINS)
CREATE TABLE federal_taxes_apportionment (
  id SERIAL PRIMARY KEY,
  reference_month DATE NOT NULL,
  total_revenue INTEGER, -- Receita total
  pis_base INTEGER,
  pis_amount INTEGER,
  cofins_base INTEGER,
  cofins_amount INTEGER,
  status VARCHAR(20) DEFAULT 'open',
  due_date DATE,
  payment_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Livro fiscal (registro de documentos)
CREATE TABLE fiscal_book (
  id SERIAL PRIMARY KEY,
  store_id INTEGER REFERENCES stores(id),
  document_type VARCHAR(20), -- nfe_in, nfe_out, nfce
  document_key VARCHAR(44) NOT NULL,
  document_number VARCHAR(20),
  document_series VARCHAR(10),
  document_date DATE NOT NULL,
  operation_type VARCHAR(10), -- entrada, saida
  cfop VARCHAR(4),
  total_amount INTEGER,
  icms_base INTEGER,
  icms_amount INTEGER,
  ipi_amount INTEGER,
  pis_amount INTEGER,
  cofins_amount INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Cálculo de Impostos**:

O sistema calculará impostos de forma automática e inteligente:

**ICMS (Estadual)**:
- Calculado por estado de destino
- Apurado mensalmente por filial
- Diferencial de alíquota (DIFAL) para vendas interestaduais
- Substituição tributária quando aplicável

**Impostos Federais (Centralizados na Matriz)**:
- PIS/COFINS: Calculados sobre receita total consolidada
- IPI: Calculado na saída de produtos industrializados
- IRPJ/CSLL: Apurados trimestralmente ou anualmente

**Integração com Agente MCP Fiscal**:

O agente MCP será responsável por:
- Calcular impostos automaticamente em cada operação
- Sugerir enquadramento tributário ideal
- Gerar guias de recolhimento (DARE, DARF)
- Preparar arquivos SPED (Fiscal, Contribuições)
- Alertar sobre prazos de entrega de obrigações
- Simular cenários tributários
- Identificar oportunidades de economia fiscal

---

## 🤖 Integração com Agentes MCP

### Arquitetura de Agentes

O sistema utilizará **três agentes MCP especializados**, cada um com responsabilidades específicas e integração profunda com o ERP.

#### Agente 1: Produção (Manufacturing Agent)

**Objetivo**: Otimizar processos produtivos e garantir eficiência operacional.

**Capacidades**:
- Planejamento de produção baseado em demanda
- Cálculo de necessidade de matéria-prima (MRP)
- Otimização de sequenciamento de ordens
- Monitoramento de KPIs de produção (OEE, lead time)
- Detecção de anomalias e desvios
- Sugestão de melhorias de processo

**Ferramentas MCP Utilizadas**:
- `asana`: Gerenciar tarefas de produção e manutenção
- `notion`: Documentar procedimentos e receitas
- `gmail`: Notificar equipe sobre ordens urgentes

**Fluxo de Trabalho**:

1. **Análise de Demanda**: Agente analisa vendas e estoque
2. **Sugestão de OP**: Propõe ordens de produção necessárias
3. **Validação Humana**: Gerente aprova ou ajusta
4. **Execução**: Sistema cria OP e reserva materiais
5. **Monitoramento**: Agente acompanha produção em tempo real
6. **Relatório**: Gera relatório de eficiência ao final

**Exemplo de Prompt para o Agente**:

```
Você é o Agente de Produção da Bem Casado.

Analise o estoque atual de produtos acabados e a demanda dos últimos 30 dias.
Identifique produtos com estoque abaixo do mínimo e sugira ordens de produção.

Para cada sugestão, calcule:
- Quantidade a produzir
- Matérias-primas necessárias
- Custo estimado de produção
- Prazo de execução

Priorize produtos com maior giro e margem de lucro.
```

#### Agente 2: Contabilidade (Accounting Agent)

**Objetivo**: Automatizar lançamentos contábeis e garantir conformidade fiscal.

**Capacidades**:
- Classificação automática de lançamentos
- Conciliação bancária automatizada
- Geração de demonstrações financeiras
- Cálculo de indicadores financeiros
- Análise de fluxo de caixa
- Preparação de documentos para auditoria

**Ferramentas MCP Utilizadas**:
- `notion`: Manter documentação contábil organizada
- `gmail`: Enviar relatórios financeiros mensais
- `google-calendar`: Agendar fechamentos contábeis

**Fluxo de Trabalho**:

1. **Captura de Eventos**: Sistema registra vendas, compras, produção
2. **Classificação**: Agente sugere contas contábeis
3. **Lançamento**: Cria débitos e créditos automaticamente
4. **Validação**: Verifica partidas dobradas e saldos
5. **Relatório**: Gera DRE e Balanço mensalmente

**Exemplo de Prompt para o Agente**:

```
Você é o Agente Contábil da Bem Casado.

Analise todas as vendas do mês e crie os lançamentos contábeis correspondentes.

Para cada venda:
- Débito: Caixa/Banco (1.1.01.001)
- Crédito: Receita de Vendas (3.1.01.001)
- Débito: CMV (4.1.01.001)
- Crédito: Estoque (1.1.03.001)

Calcule o CMV usando o custo médio ponderado de cada produto.
Gere um resumo com total de receitas, CMV e lucro bruto.
```

#### Agente 3: Fiscal (Tax Agent)

**Objetivo**: Garantir conformidade tributária e otimizar carga fiscal.

**Capacidades**:
- Cálculo automático de impostos
- Apuração de ICMS por estado
- Apuração de impostos federais
- Geração de SPED Fiscal e Contribuições
- Identificação de benefícios fiscais aplicáveis
- Simulação de cenários tributários
- Alertas de prazos de obrigações

**Ferramentas MCP Utilizadas**:
- `notion`: Manter calendário de obrigações fiscais
- `gmail`: Enviar alertas de vencimentos
- `google-calendar`: Agendar entregas de SPED

**Fluxo de Trabalho**:

1. **Captura de Operações**: Sistema registra vendas e compras
2. **Classificação Fiscal**: Agente determina CFOP, CST, alíquotas
3. **Cálculo de Impostos**: Calcula ICMS, PIS, COFINS, IPI
4. **Apuração Mensal**: Consolida impostos a recolher
5. **Geração de Guias**: Cria DARE e DARF automaticamente
6. **SPED**: Gera arquivos para envio à Receita

**Exemplo de Prompt para o Agente**:

```
Você é o Agente Fiscal da Bem Casado.

Analise todas as vendas da Filial RJ (CNPJ 12345678000271) no mês de dezembro/2024.

Para cada venda:
1. Identifique o estado de destino
2. Determine a alíquota de ICMS aplicável
3. Calcule o ICMS a recolher
4. Verifique se há substituição tributária

Ao final, gere:
- Apuração total de ICMS do mês
- Guia DARE para pagamento
- Arquivo SPED Fiscal

Considere que a empresa é do Simples Nacional.
```

### Comunicação Entre Agentes e Sistema

Os agentes se comunicarão com o sistema através de **APIs REST** e **webhooks**:

```typescript
// Exemplo de API para o Agente de Produção

// 1. Agente consulta estoque baixo
GET /api/agent/production/low-stock
Response: [
  { productId: 1, name: "Arroz Integral 1kg", stock: 30, minStock: 100 },
  { productId: 5, name: "Feijão Preto 1kg", stock: 15, minStock: 50 }
]

// 2. Agente sugere ordem de produção
POST /api/agent/production/suggest-order
Body: {
  productId: 1,
  quantity: 200,
  priority: "high",
  reason: "Estoque crítico - demanda alta"
}

// 3. Sistema cria OP após aprovação humana
POST /api/production/orders
Body: {
  recipeId: 1,
  productId: 1,
  plannedQuantity: 200,
  responsibleUserId: 5
}
```

---

## 📊 Diagrama de Arquitetura Completa

```
┌─────────────────────────────────────────────────────────────────┐
│                    CAMADA DE APRESENTAÇÃO                        │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │   PDV    │  │   Loja   │  │  Admin   │  │ Dashboard│       │
│  │  (React) │  │  Online  │  │  Panel   │  │  Gerenc. │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CAMADA DE APLICAÇÃO (tRPC)                    │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Vendas  │  │  Estoque │  │ Produção │  │  Fiscal  │       │
│  │  Router  │  │  Router  │  │  Router  │  │  Router  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                     │
│  │Contábil  │  │   NF-e   │  │  Ajustes │                     │
│  │  Router  │  │  Router  │  │  Router  │                     │
│  └──────────┘  └──────────┘  └──────────┘                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CAMADA DE AGENTES MCP                         │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Agente de  │  │   Agente de  │  │   Agente de  │         │
│  │   Produção   │  │ Contabilidade│  │    Fiscal    │         │
│  │              │  │              │  │              │         │
│  │ • Planejar   │  │ • Lançamentos│  │ • Calcular   │         │
│  │ • Otimizar   │  │ • DRE/Balanço│  │   impostos   │         │
│  │ • Monitorar  │  │ • Indicadores│  │ • SPED       │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         │                  │                  │                 │
│         └──────────────────┼──────────────────┘                 │
│                            │                                     │
│                  ┌─────────▼─────────┐                          │
│                  │  MCP Servers      │                          │
│                  │  • Asana          │                          │
│                  │  • Notion         │                          │
│                  │  • Gmail          │                          │
│                  │  • Calendar       │                          │
│                  └───────────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CAMADA DE DADOS (PostgreSQL)                  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  MÓDULO VAREJO (✅ Implementado)                         │  │
│  │  stores, products, productStocks, orders, nfce           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  MÓDULO DISTRIBUIÇÃO (🔄 Parcial)                        │  │
│  │  suppliers, stockMovements, stockBatches                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  MÓDULO INDÚSTRIA (🎯 Futuro)                            │  │
│  │  raw_materials, production_recipes, production_orders    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  MÓDULO CONTÁBIL (🎯 Futuro)                             │  │
│  │  chart_of_accounts, accounting_entries, accounts_payable │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  MÓDULO FISCAL (🎯 Futuro)                               │  │
│  │  tax_rules, icms_apportionment, fiscal_book              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INTEGRAÇÕES EXTERNAS                          │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Focus   │  │ Gateways │  │  Bancos  │  │  SEFAZ   │       │
│  │  NF-e    │  │Pagamento │  │  (API)   │  │  (SPED)  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗺️ Roadmap de Implementação

### Fase 1: Consolidação do Varejo (✅ Concluída)

**Duração**: 2 meses  
**Status**: Implementado

**Entregas**:
- ✅ PDV funcional com emissão de NFC-e
- ✅ Loja online integrada
- ✅ Sistema multi-filial
- ✅ Gestão de estoque por filial
- ✅ Importação de XML de NF-e
- ✅ Ajustes manuais com auditoria
- ✅ Cálculo de custo médio ponderado

---

### Fase 2: Distribuição Avançada (🔄 Em andamento)

**Duração**: 1 mês  
**Prioridade**: Alta

**Entregas**:
- 🔄 Gestão completa de fornecedores
- 🔄 Pedidos de compra com aprovação
- 🔄 Controle de qualidade na entrada
- 🔄 Rastreamento de lotes e validade
- 🔄 Alertas de vencimento
- 🔄 Relatórios de giro de estoque

**Tabelas a Criar**:
- `purchase_orders` - Pedidos de compra
- `purchase_order_items` - Itens do pedido
- `quality_checks` - Inspeções de qualidade

---

### Fase 3: Indústria/Manufatura (🎯 Próxima)

**Duração**: 2-3 meses  
**Prioridade**: Média

**Entregas**:
- 🎯 Cadastro de matérias-primas
- 🎯 Receitas de produção (BOM)
- 🎯 Ordens de produção
- 🎯 Apontamento de produção
- 🎯 Controle de perdas e refugos
- 🎯 Cálculo de custo de produção
- 🎯 Rastreabilidade de lotes

**Integração com Agente MCP**:
- Planejamento automático de produção
- Otimização de sequenciamento
- Monitoramento de KPIs

**Pré-requisitos**:
- Fase 2 concluída
- Agente MCP de Produção configurado

---

### Fase 4: Contabilidade Integrada (🎯 Futuro)

**Duração**: 2 meses  
**Prioridade**: Média

**Entregas**:
- 🎯 Plano de contas contábil
- 🎯 Lançamentos automáticos
- 🎯 Conciliação bancária
- 🎯 DRE e Balanço automatizados
- 🎯 Fluxo de caixa projetado
- 🎯 Contas a pagar e receber

**Integração com Agente MCP**:
- Classificação automática de lançamentos
- Geração de relatórios financeiros
- Análise de indicadores

**Pré-requisitos**:
- Fase 3 concluída
- Agente MCP Contábil configurado

---

### Fase 5: Gestão Fiscal Completa (🎯 Futuro)

**Duração**: 3-4 meses  
**Prioridade**: Alta (Compliance)

**Entregas**:
- 🎯 Cálculo automático de impostos
- 🎯 Apuração de ICMS por estado
- 🎯 Apuração de impostos federais
- 🎯 Geração de SPED Fiscal
- 🎯 Geração de SPED Contribuições
- 🎯 Gestão de substituição tributária
- 🎯 Simulador de cenários fiscais

**Integração com Agente MCP**:
- Cálculo inteligente de impostos
- Identificação de benefícios fiscais
- Geração automática de SPED
- Alertas de prazos

**Pré-requisitos**:
- Fase 4 concluída
- Agente MCP Fiscal configurado
- Consultoria tributária contratada

---

### Fase 6: Business Intelligence (🎯 Futuro)

**Duração**: 1-2 meses  
**Prioridade**: Baixa (Nice to have)

**Entregas**:
- 🎯 Dashboard executivo
- 🎯 Análise de vendas por produto/filial
- 🎯 Análise de rentabilidade
- 🎯 Previsão de demanda (ML)
- 🎯 Análise de custos de produção
- 🎯 Benchmarking entre filiais

**Ferramentas**:
- Metabase ou Superset (open source)
- Python para modelos de ML
- Integração com Google Data Studio

---

## 💰 Estimativa de Custos e Recursos

### Investimento por Fase

| Fase | Duração | Desenvolvedores | Custo Estimado |
|------|---------|-----------------|----------------|
| Fase 1 (Varejo) | 2 meses | 2 devs | ✅ Concluída |
| Fase 2 (Distribuição) | 1 mês | 1 dev | R$ 15.000 |
| Fase 3 (Indústria) | 3 meses | 2 devs | R$ 45.000 |
| Fase 4 (Contabilidade) | 2 meses | 1 dev + 1 contador | R$ 35.000 |
| Fase 5 (Fiscal) | 4 meses | 2 devs + 1 consultor fiscal | R$ 80.000 |
| Fase 6 (BI) | 2 meses | 1 dev + 1 analista | R$ 25.000 |
| **TOTAL** | **14 meses** | - | **R$ 200.000** |

### Custos Recorrentes

| Item | Custo Mensal | Custo Anual |
|------|--------------|-------------|
| Hospedagem (Railway) | R$ 200 | R$ 2.400 |
| Focus NF-e (por filial) | R$ 50 | R$ 600 |
| Certificados Digitais (por filial) | R$ 17 | R$ 200 |
| Manutenção e Suporte | R$ 2.000 | R$ 24.000 |
| **TOTAL (3 filiais)** | **R$ 2.400** | **R$ 28.800** |

---

## 🎯 Benefícios Esperados

### Quantitativos

- **Redução de 70%** no tempo de fechamento contábil
- **Redução de 50%** em erros de cálculo de impostos
- **Aumento de 30%** na eficiência de produção
- **Redução de 40%** em custos de estoque (melhor giro)
- **Economia de 20%** em carga tributária (planejamento fiscal)

### Qualitativos

- **Rastreabilidade completa** de produtos (do grão ao cliente)
- **Conformidade fiscal** garantida (redução de riscos)
- **Decisões baseadas em dados** (BI integrado)
- **Automação de processos** repetitivos (agentes MCP)
- **Escalabilidade** para crescimento nacional

---

## 📞 Próximos Passos

### Imediatos (Próximas 2 semanas)

1. **Validar arquitetura** com stakeholders
2. **Priorizar Fase 2** (Distribuição Avançada)
3. **Configurar agentes MCP** em ambiente de desenvolvimento
4. **Contratar consultor fiscal** para Fase 5

### Curto Prazo (1-3 meses)

1. **Implementar Fase 2** completa
2. **Testar integração** com agente de produção
3. **Iniciar Fase 3** (Indústria)
4. **Documentar processos** atuais

### Médio Prazo (3-6 meses)

1. **Concluir Fase 3** (Indústria)
2. **Iniciar Fase 4** (Contabilidade)
3. **Treinar equipe** nos novos módulos
4. **Expandir para novas filiais**

### Longo Prazo (6-12 meses)

1. **Concluir Fase 5** (Fiscal)
2. **Implementar Fase 6** (BI)
3. **Otimizar processos** com base em dados
4. **Avaliar expansão** para outros produtos

---

## 📚 Conclusão

A arquitetura proposta permite a **evolução natural** do sistema Bem Casado desde um PDV/Loja Online até um **ERP Industrial Completo**, aproveitando 100% da infraestrutura já desenvolvida. A abordagem modular garante que cada fase pode ser implementada de forma independente, sem interromper as operações atuais.

A integração com **agentes MCP especializados** traz automação inteligente para processos complexos como produção, contabilidade e gestão fiscal, reduzindo erros humanos e aumentando a eficiência operacional. A arquitetura centralizada com dados compartilhados e isolados garante escalabilidade ilimitada, permitindo crescimento nacional sem degradação de performance.

O investimento estimado de **R$ 200.000** ao longo de 14 meses é compatível com o retorno esperado através de redução de custos operacionais, aumento de eficiência e conformidade fiscal garantida. O sistema resultante será uma plataforma robusta, escalável e inteligente, capaz de suportar o crescimento da Bem Casado por muitos anos.

---

**Documento preparado por**: Equipe de Arquitetura Bem Casado  
**Data**: Dezembro 2024  
**Versão**: 1.0  
**Próxima revisão**: Após validação com stakeholders
