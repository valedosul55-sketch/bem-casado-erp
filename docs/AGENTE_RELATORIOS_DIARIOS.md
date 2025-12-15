# 📧 Agente de Relatórios Diários Executivos

## 📋 Visão Geral

O **Agente de Relatórios Diários** é um agente coordenador que compila informações de todas as áreas do ERP (vendas, estoque, produção, contabilidade, fiscal) e envia um **email executivo consolidado** todos os dias para a diretoria e gerentes.

Este agente atua como um **dashboard por email**, fornecendo uma visão panorâmica do negócio sem necessidade de acessar o sistema.

---

## 🎯 Objetivo

Fornecer à diretoria e gerentes um **resumo executivo diário** com os principais KPIs de todas as áreas, permitindo tomada de decisão rápida e informada.

## ⏰ Execução

**Todos os dias às 07:00** (antes do expediente)

## 📊 Áreas Cobertas

1. **Vendas**: Faturamento, ticket médio, comparativos
2. **Estoque**: Produtos críticos, alertas de ruptura
3. **Produção**: Ordens em andamento, eficiência
4. **Contabilidade**: Fluxo de caixa, contas a pagar/receber
5. **Fiscal**: Impostos apurados, obrigações pendentes
6. **Operacional**: Desempenho por filial, alertas

---

## 📧 Estrutura do Email

### Cabeçalho
- Data e período do relatório
- Resumo executivo com principais métricas

### Seções Principais

**1. Vendas**
- Faturamento total e por filial
- Número de pedidos
- Ticket médio
- Comparativo com dia anterior
- Produtos mais vendidos

**2. Estoque**
- Produtos críticos (< mínimo)
- Alertas de ruptura
- Valor imobilizado

**3. Produção**
- Ordens concluídas
- Ordens em andamento
- KPIs (OEE, perdas)

**4. Contabilidade**
- Fluxo de caixa do dia
- Contas a pagar/receber (próximos 7 dias)
- Indicadores financeiros

**5. Fiscal**
- Impostos apurados por filial
- ICMS estadual (cada filial)
- Impostos federais (matriz)
- Obrigações pendentes

**6. Alertas e Ações**
- Alertas críticos
- Oportunidades identificadas
- Ações recomendadas

---

## 🤖 Integração com Outros Agentes

O Agente de Relatórios Diários **coordena** os outros 3 agentes:

### Agente de Produção
- Fornece dados de ordens de produção
- KPIs de eficiência e perdas
- Alertas de materiais

### Agente de Contabilidade
- Fornece fluxo de caixa
- Indicadores financeiros
- Contas a pagar/receber

### Agente Fiscal
- Fornece impostos apurados
- Obrigações pendentes
- Prazos críticos

---

## 📧 Destinatários

- Diretoria
- Gerente Geral
- Gerente de Produção
- Gerente Financeiro
- Contador
- Gerentes de Filial (opcional)

---

## 💡 Benefícios

✅ Visão consolidada em um único email  
✅ Tomada de decisão sem acessar sistemas  
✅ Alertas proativos sobre problemas  
✅ Comparativos de performance  
✅ Identificação de tendências  

---

**Documento preparado por**: Equipe de Arquitetura Bem Casado  
**Data**: Dezembro 2024  
**Versão**: 1.0
