# ⚖️ Agente de Legislação Fiscal e Contábil (Tax & Accounting Legislation Agent)

## 📋 Visão Geral

O **Agente de Legislação Fiscal e Contábil** é uma versão especializada do NewsMonitoringAgent, focada **exclusivamente** em monitorar mudanças legislativas, normativas e regulatórias que impactam a tributação e contabilidade do agronegócio. **Não monitora cotações, clima ou mercado geral** - apenas legislação pura.

---

## 🎯 Objetivo e Escopo

### Objetivo Principal

Garantir **conformidade legal** através do monitoramento contínuo de publicações oficiais (DOU, SEFAZ, Receita Federal, CONFAZ, CFC) e alertar a diretoria sobre **mudanças legislativas críticas** que exigem ação imediata.

### O que o Agente FAZ

✅ Monitora Diário Oficial da União (DOU) diariamente  
✅ Busca Instruções Normativas da Receita Federal  
✅ Acompanha Convênios e Protocolos do CONFAZ  
✅ Verifica mudanças em SPED (layouts, prazos)  
✅ Alerta sobre vencimento de certificados digitais  
✅ Monitora reforma tributária (IBS, CBS, IVA)  
✅ Identifica novos incentivos fiscais  
✅ Acompanha normas contábeis (NBC TG, CPC)  

### O que o Agente NÃO FAZ

❌ Não monitora cotações de arroz/feijão  
❌ Não coleta dados de clima  
❌ Não busca notícias gerais de mercado  
❌ Não monitora USDA ou FAO  
❌ Não acompanha preços de commodities  

---

## 📊 Fontes de Informação (Apenas Oficiais)

### 1. Diário Oficial da União (DOU) ⭐ **PRINCIPAL**

**URL**: https://www.in.gov.br/  
**Frequência**: Diária (dias úteis)  
**Seções Monitoradas**:
- Seção 1: Leis, Decretos, Medidas Provisórias
- Seção 2: Atos de pessoal (quando relevante)
- Seção 3: Contratos, editais

**Palavras-chave Críticas**:
```
- "ICMS" + "grãos" / "arroz" / "feijão" / "produtos agrícolas"
- "PIS/COFINS" + "agronegócio" / "produtor rural"
- "SPED" + "prazo" / "layout" / "versão"
- "reforma tributária" + "IBS" / "CBS" / "IVA"
- "Instrução Normativa" + "Receita Federal"
- "Portaria" + "Ministério da Agricultura" / "MAPA"
- "Convênio" + "CONFAZ"
- "certificado digital" + "ICP-Brasil"
```

**Exemplo de Busca**:
```python
dou_query = """
(
    ("Instrução Normativa" OR "Portaria" OR "Resolução" OR "Decreto" OR "Lei")
    AND
    ("Receita Federal" OR "SEFAZ" OR "CONFAZ" OR "MAPA")
    AND
    ("ICMS" OR "PIS" OR "COFINS" OR "SPED" OR "reforma tributária")
    AND
    ("arroz" OR "feijão" OR "grãos" OR "produtos agrícolas" OR "agronegócio")
)
OR
(
    "reforma tributária" AND ("IBS" OR "CBS" OR "IVA" OR "cesta básica")
)
OR
(
    "SPED" AND ("prazo" OR "layout" OR "versão" OR "obrigatoriedade")
)
```

---

### 2. Receita Federal do Brasil (RFB)

**URL**: https://www.gov.br/receitafederal/  
**Frequência**: Diária  
**Seções Monitoradas**:
- Legislação e Normas
- Instruções Normativas
- Atos Declaratórios
- Soluções de Consulta

**Palavras-chave Críticas**:
```
- "Instrução Normativa RFB"
- "Ato Declaratório"
- "Solução de Consulta"
- "PIS/COFINS"
- "DCTF"
- "ECF"
- "ECD"
- "eSocial"
```

---

### 3. CONFAZ (Conselho Nacional de Política Fazendária)

**URL**: https://www.confaz.fazenda.gov.br/  
**Frequência**: Semanal  
**Documentos Monitorados**:
- Convênios ICMS
- Protocolos ICMS
- Ajustes SINIEF

**Palavras-chave Críticas**:
```
- "Convênio ICMS"
- "Protocolo ICMS"
- "Ajuste SINIEF"
- "produtos agrícolas"
- "grãos"
- "substituição tributária"
```

---

### 4. Secretarias Estaduais de Fazenda (SEFAZ)

**Estados Prioritários**: RS, SC, PR, SP, MG (principais produtores e consumidores)

**Frequência**: Semanal  
**Documentos Monitorados**:
- Decretos estaduais
- Portarias SEFAZ
- Comunicados

**Palavras-chave Críticas**:
```
- "Decreto" + número do estado
- "Portaria SEFAZ"
- "ICMS"
- "alíquota"
- "produtos agrícolas"
```

---

### 5. Conselho Federal de Contabilidade (CFC)

**URL**: https://cfc.org.br/  
**Frequência**: Mensal  
**Documentos Monitorados**:
- NBC TG (Normas Brasileiras de Contabilidade Técnicas Gerais)
- NBC TSP (Setor Público)
- ITG (Interpretações Técnicas)

**Palavras-chave Críticas**:
```
- "NBC TG"
- "ITG"
- "Resolução CFC"
- "norma contábil"
- "atividade rural"
- "estoques"
- "receita"
```

---

### 6. Comitê de Pronunciamentos Contábeis (CPC)

**URL**: http://www.cpc.org.br/  
**Frequência**: Mensal  
**Documentos Monitorados**:
- Pronunciamentos Técnicos
- Interpretações
- Orientações

**Palavras-chave Críticas**:
```
- "CPC"
- "Pronunciamento Técnico"
- "Interpretação"
- "estoques"
- "receita"
- "ativo biológico"
- "propriedade para investimento"
```

---

### 7. Congresso Nacional (Reforma Tributária)

**URL**: https://www.congressonacional.leg.br/  
**Frequência**: Diária (durante tramitação)  
**Documentos Monitorados**:
- PEC 45/2019 (Reforma Tributária)
- Projetos de Lei Complementar
- Emendas

**Palavras-chave Críticas**:
```
- "PEC 45"
- "reforma tributária"
- "IBS"
- "CBS"
- "IVA"
- "cesta básica"
- "alíquota reduzida"
- "produtos essenciais"
```

---

## 🔍 Palavras-Chave Configuradas

### Prioridade CRÍTICA (Busca Diária)

```typescript
const CRITICAL_KEYWORDS = [
  // Reforma Tributária
  'reforma tributária',
  'IBS',
  'CBS',
  'IVA',
  'PEC 45',
  'cesta básica',
  
  // ICMS
  'ICMS agronegócio',
  'ICMS grãos',
  'ICMS arroz',
  'ICMS feijão',
  'CONFAZ',
  'Convênio ICMS',
  'Protocolo ICMS',
  
  // SPED
  'SPED',
  'SPED Fiscal',
  'SPED Contribuições',
  'EFD-ICMS/IPI',
  'EFD-Contribuições',
  'prazo SPED',
  'layout SPED',
  'versão SPED',
  
  // Certificado Digital
  'certificado digital',
  'ICP-Brasil',
  'renovação certificado',
  
  // PIS/COFINS
  'PIS/COFINS agronegócio',
  'crédito PIS',
  'crédito COFINS',
  'alíquota zero'
];
```

### Prioridade ALTA (Busca Diária)

```typescript
const HIGH_KEYWORDS = [
  // Legislação Geral
  'Instrução Normativa',
  'IN RFB',
  'Portaria',
  'Decreto',
  'Resolução',
  'Medida Provisória',
  
  // Órgãos
  'Receita Federal',
  'RFB',
  'SEFAZ',
  'Ministério da Agricultura',
  'MAPA',
  
  // Obrigações
  'DCTF',
  'DCTF-Web',
  'ECF',
  'ECD',
  'eSocial',
  'DIRF',
  'RAIS'
];
```

### Prioridade MÉDIA (Busca Semanal)

```typescript
const MEDIUM_KEYWORDS = [
  // Contabilidade
  'NBC TG',
  'CPC',
  'ITG',
  'norma contábil',
  'pronunciamento técnico',
  
  // Outros Tributos
  'IPI',
  'Funrural',
  'INSS patronal',
  'SENAR',
  
  // Incentivos
  'incentivo fiscal',
  'benefício fiscal',
  'isenção',
  'crédito presumido',
  'drawback'
];
```

---

## 📧 Estrutura do Relatório Diário

### Cabeçalho

```
⚖️ MONITORAMENTO LEGISLATIVO - FISCAL E CONTÁBIL
📅 Sexta-feira, 13 de Dezembro de 2024
⏰ Relatório gerado às 08:00

🎯 RESUMO EXECUTIVO
• 5 publicações relevantes no DOU
• 2 alertas de impacto crítico
• 1 nova Instrução Normativa RFB
• 3 ações obrigatórias identificadas
```

---

### Seção 1: Alertas Críticos (Ação Imediata)

```
🔴 ALERTAS CRÍTICOS - AÇÃO IMEDIATA

1. ⚠️ CERTIFICADO DIGITAL: Vencimento em 15 dias
   📅 Publicação: ICP-Brasil | 12/12/2024
   📅 Prazo: 27/12/2024
   
   📝 Descrição:
   Certificado digital A1 da empresa vence em 27/12/2024.
   Sem certificado válido, não será possível emitir NF-e.
   
   💡 Impacto: CRÍTICO
   • Operação pode parar completamente
   • Vendas serão bloqueadas
   • Multa por emissão irregular: R$ 5.000 por nota
   
   ✅ Ação Obrigatória:
   Renovar certificado URGENTEMENTE até 20/12/2024
   Responsável: TI + Contabilidade
   Custo: R$ 200-400
   
   🔗 Link: [URL do ICP-Brasil]

---

2. ⚠️ SPED: Novo layout obrigatório a partir de janeiro/2025
   📅 Publicação: DOU | 11/12/2024 | Instrução Normativa RFB nº 2.200/2024
   📅 Prazo: 01/01/2025 (18 dias)
   
   📝 Descrição:
   EFD-ICMS/IPI versão 3.1.0 torna-se obrigatória para fatos geradores
   a partir de 01/01/2025. Inclui novos registros para controle de
   estoque de produtos agrícolas.
   
   💡 Impacto: ALTO
   • Sistema ERP precisa ser atualizado
   • Sem atualização, SPED será rejeitado
   • Multa por não entrega: R$ 5.000/mês
   • Multa por entrega com erro: R$ 500/mês
   
   ✅ Ação Obrigatória:
   1. Contratar atualização do sistema ERP
   2. Testar novo layout em ambiente de homologação
   3. Treinar equipe fiscal
   
   Responsável: TI + Fiscal
   Prazo: Até 20/12/2024
   Custo estimado: R$ 3.000-5.000
   
   🔗 Link: [URL do DOU]
   📄 Anexo: Manual do novo layout

---

3. ⚠️ REFORMA TRIBUTÁRIA: Consulta pública sobre cesta básica
   📅 Publicação: Senado Federal | 10/12/2024
   📅 Prazo: 20/12/2024
   
   📝 Descrição:
   Senado abre consulta pública sobre definição de produtos da
   cesta básica que terão alíquota reduzida de 50% no IBS/CBS.
   Arroz e feijão estão na lista preliminar.
   
   💡 Impacto: ESTRATÉGICO
   • Redução de 50% na carga tributária a partir de 2026
   • Oportunidade de influenciar regulamentação
   • Competitividade aumentará significativamente
   
   ✅ Ação Recomendada:
   Participar da consulta pública manifestando apoio à inclusão
   de arroz e feijão na cesta básica com alíquota reduzida.
   
   Responsável: Diretoria + Jurídico
   Prazo: Até 18/12/2024
   
   🔗 Link: [URL da consulta pública]
```

---

### Seção 2: Publicações no DOU (Últimas 24h)

```
📜 DIÁRIO OFICIAL DA UNIÃO - ÚLTIMAS 24 HORAS

1. Instrução Normativa RFB nº 2.201/2024
   📅 Publicação: 12/12/2024 | Vigência: 01/01/2025
   
   📝 Assunto: Altera regras de crédito de PIS/COFINS para insumos agrícolas
   
   💡 Principais Mudanças:
   • Amplia lista de insumos que geram crédito
   • Inclui embalagens biodegradáveis
   • Exige documentação adicional (nota fiscal + laudo técnico)
   
   💰 Impacto Financeiro:
   • Potencial aumento de créditos: R$ 2.000-3.000/mês
   • Requer controle adicional de documentação
   
   ✅ Ação:
   Revisar processo de apropriação de créditos
   Responsável: Contabilidade
   Prazo: Até 31/12/2024
   
   🔗 Link: [URL do DOU]

---

2. Portaria MAPA nº 456/2024
   📅 Publicação: 12/12/2024 | Vigência: 01/02/2025
   
   📝 Assunto: Novas regras para armazenagem de grãos
   
   💡 Principais Mudanças:
   • Exigência de certificação sanitária trimestral
   • Limite de umidade: máximo 13% para arroz
   • Controle de temperatura obrigatório
   • Penalidades: R$ 10.000 a R$ 100.000
   
   ✅ Ação:
   1. Solicitar certificação sanitária
   2. Instalar termômetros nos silos
   3. Revisar procedimentos de armazenagem
   
   Responsável: Operações + Qualidade
   Prazo: Até 25/01/2025
   Custo estimado: R$ 8.000-12.000
   
   🔗 Link: [URL do DOU]

---

3. Convênio ICMS nº 234/2024 (CONFAZ)
   📅 Publicação: 11/12/2024 | Vigência: 01/01/2025
   
   📝 Assunto: Redução de alíquota de ICMS para arroz em SC e PR
   
   💡 Principais Mudanças:
   • SC: Alíquota reduzida de 12% para 7%
   • PR: Alíquota reduzida de 12% para 9%
   • Válido apenas para arroz tipo 1 e 2
   • Exige cadastro prévio na SEFAZ
   
   💰 Impacto Financeiro:
   • Redução de custos: R$ 5.000-8.000/mês
   • Aumento de competitividade em SC e PR
   
   ✅ Ação:
   1. Cadastrar empresa na SEFAZ-SC e SEFAZ-PR
   2. Atualizar tabela de tributação no ERP
   3. Comunicar equipe comercial
   
   Responsável: Fiscal + TI
   Prazo: Até 20/12/2024
   
   🔗 Link: [URL do CONFAZ]
```

---

### Seção 3: Receita Federal (Instruções Normativas e Atos)

```
🏛️ RECEITA FEDERAL DO BRASIL

1. Solução de Consulta COSIT nº 567/2024
   📅 Publicação: 10/12/2024
   
   📝 Assunto: Tratamento tributário de perdas de estoque por vencimento
   
   💡 Esclarecimento:
   Perdas de estoque por vencimento de produtos agrícolas podem ser
   deduzidas da base de cálculo do IRPJ e CSLL desde que:
   • Comprovadas por laudo técnico
   • Registradas em livro de inventário
   • Comunicadas à fiscalização em até 30 dias
   
   ✅ Ação:
   Implementar procedimento de documentação de perdas
   Responsável: Contabilidade + Qualidade
   
   🔗 Link: [URL da RFB]

---

2. Ato Declaratório Executivo CODAC nº 89/2024
   📅 Publicação: 09/12/2024
   
   📝 Assunto: Prorrogação de prazo para entrega da ECF 2024
   
   💡 Informação:
   Prazo de entrega da ECF (Escrituração Contábil Fiscal) referente
   ao ano-calendário 2024 prorrogado de 31/07/2025 para 30/09/2025.
   
   ✅ Ação:
   Atualizar cronograma de obrigações acessórias
   Responsável: Contabilidade
   
   🔗 Link: [URL da RFB]
```

---

### Seção 4: CONFAZ (Convênios e Protocolos ICMS)

```
🤝 CONFAZ - CONVÊNIOS E PROTOCOLOS ICMS

1. Protocolo ICMS nº 78/2024
   📅 Publicação: 08/12/2024 | Adesão: RS, SC, PR, SP
   
   📝 Assunto: Substituição tributária de produtos agrícolas beneficiados
   
   💡 Resumo:
   Estabelece regime de substituição tributária para arroz e feijão
   embalados (acima de 5kg) nas operações interestaduais entre
   RS, SC, PR e SP.
   
   💰 Impacto:
   • Empresa passa a ser responsável pelo recolhimento do ICMS
     devido nas operações subsequentes
   • Aumenta capital de giro necessário
   • Simplifica obrigações acessórias
   
   ✅ Ação:
   1. Avaliar impacto no fluxo de caixa
   2. Atualizar sistema de cálculo de ICMS-ST
   3. Treinar equipe fiscal
   
   Responsável: Fiscal + Financeiro
   Prazo: Até 31/12/2024
   
   🔗 Link: [URL do CONFAZ]
```

---

### Seção 5: Normas Contábeis (CFC e CPC)

```
📊 NORMAS CONTÁBEIS

1. NBC TG 16 (R3) - Estoques (Revisão)
   📅 Publicação: CFC | 05/12/2024 | Vigência: 01/01/2025
   
   📝 Assunto: Atualização de regras de mensuração de estoques
   
   💡 Principais Mudanças:
   • Esclarece tratamento de custos de armazenagem
   • Define critérios para teste de recuperabilidade
   • Exige divulgação adicional em notas explicativas
   
   ✅ Ação:
   1. Revisar política contábil de estoques
   2. Atualizar procedimentos de fechamento
   3. Ajustar notas explicativas
   
   Responsável: Contabilidade
   Prazo: Até 31/12/2024
   
   🔗 Link: [URL do CFC]

---

2. Interpretação Técnica ITG 2000 (R2) - Atividade Rural
   📅 Publicação: CFC | 03/12/2024 | Vigência: 01/01/2025
   
   📝 Assunto: Esclarecimentos sobre contabilização de ativo biológico
   
   💡 Resumo:
   Esclarece que produtos agrícolas em estoque (arroz e feijão já
   colhidos) não são ativos biológicos, devem ser tratados como
   estoques conforme NBC TG 16.
   
   ✅ Ação:
   Revisar classificação contábil de estoques
   Responsável: Contabilidade
   
   🔗 Link: [URL do CFC]
```

---

### Seção 6: Reforma Tributária (Acompanhamento)

```
⚖️ REFORMA TRIBUTÁRIA - ACOMPANHAMENTO

📅 Status Atual: PEC 45/2019 promulgada | Regulamentação em andamento

🔄 Últimas Atualizações (Última Semana)

1. Projeto de Lei Complementar nº 68/2024
   📅 12/12/2024 | Senado Federal
   
   📝 Assunto: Regulamenta alíquotas do IBS e CBS
   
   💡 Destaques:
   • Alíquota padrão: 26,5% (IBS + CBS)
   • Alíquota reduzida (50%): 13,25% para cesta básica
   • Arroz e feijão confirmados na cesta básica
   • Vigência: 2026 (início da transição)
   
   📊 Simulação de Impacto:
   • Carga tributária atual (ICMS + PIS/COFINS): ~20%
   • Carga tributária futura (IBS + CBS reduzido): ~13,25%
   • **Redução estimada: 6,75 pontos percentuais**
   • **Economia anual estimada: R$ 150.000-200.000**
   
   ✅ Ação:
   Acompanhar tramitação e preparar empresa para transição
   Responsável: Diretoria + Fiscal
   
   🔗 Link: [URL do Senado]

---

2. Consulta Pública nº 45/2024
   📅 10/12/2024 | Comitê Gestor do IBS
   
   📝 Assunto: Definição de produtos da cesta básica
   
   💡 Informação:
   Consulta pública aberta até 20/12/2024 para manifestação sobre
   quais produtos devem compor a cesta básica com alíquota reduzida.
   
   ✅ Ação:
   Participar da consulta pública
   Prazo: Até 18/12/2024
   Responsável: Diretoria
   
   🔗 Link: [URL da consulta]
```

---

### Seção 7: Análise e Recomendações

```
📊 ANÁLISE ESTRATÉGICA

⚠️ AÇÕES OBRIGATÓRIAS (Prazo Crítico)

1. RENOVAR CERTIFICADO DIGITAL
   • Prazo: 20/12/2024 (7 dias)
   • Impacto: CRÍTICO (operação pode parar)
   • Responsável: TI + Contabilidade
   • Custo: R$ 200-400

2. ATUALIZAR SISTEMA ERP (Novo layout SPED)
   • Prazo: 20/12/2024 (7 dias)
   • Impacto: ALTO (multa R$ 5.000/mês)
   • Responsável: TI + Fiscal
   • Custo: R$ 3.000-5.000

3. PARTICIPAR DE CONSULTA PÚBLICA (Reforma Tributária)
   • Prazo: 18/12/2024 (5 dias)
   • Impacto: ESTRATÉGICO (economia futura)
   • Responsável: Diretoria + Jurídico
   • Custo: R$ 0

---

💰 OPORTUNIDADES IDENTIFICADAS

1. CRÉDITO DE PIS/COFINS AMPLIADO
   • IN RFB 2.201/2024
   • Potencial: R$ 2.000-3.000/mês
   • Ação: Revisar apropriação de créditos

2. REDUÇÃO DE ICMS EM SC E PR
   • Convênio ICMS 234/2024
   • Economia: R$ 5.000-8.000/mês
   • Ação: Cadastrar na SEFAZ até 20/12

3. REFORMA TRIBUTÁRIA (Médio Prazo)
   • Redução de 6,75 pontos percentuais
   • Economia anual: R$ 150.000-200.000
   • Ação: Preparar transição

---

📋 OBRIGAÇÕES ACESSÓRIAS - PRÓXIMOS 30 DIAS

| Obrigação | Período | Prazo | Status |
|-----------|---------|-------|--------|
| SPED Fiscal | 11/2024 | 20/12/2024 | ⚠️ Pendente |
| SPED Contribuições | 11/2024 | 20/12/2024 | ⚠️ Pendente |
| DCTF-Web | 11/2024 | 20/12/2024 | ⚠️ Pendente |
| GIA-ST (SP) | 11/2024 | 10/01/2025 | 🟢 No prazo |
| DIME (RS) | 11/2024 | 10/01/2025 | 🟢 No prazo |

---

🎯 RESUMO DE IMPACTOS

| Tipo | Quantidade | Ação Obrigatória | Oportunidade |
|------|------------|------------------|--------------|
| CRÍTICO | 1 | Renovar certificado | - |
| ALTO | 2 | Atualizar SPED + Cadastrar SEFAZ | Redução ICMS |
| MÉDIO | 3 | Revisar processos | Crédito PIS/COFINS |
| ESTRATÉGICO | 1 | Consulta pública | Reforma tributária |

---

💡 RECOMENDAÇÃO PRINCIPAL

**Prioridade 1**: Renovar certificado digital URGENTEMENTE (7 dias)  
**Prioridade 2**: Atualizar sistema ERP para novo SPED (7 dias)  
**Prioridade 3**: Participar de consulta pública reforma tributária (5 dias)
```

---

### Rodapé

```
---
⚖️ Este relatório foi gerado automaticamente pelo Agente de Legislação Fiscal e Contábil.
🤖 Sistema: ERP Bem Casado v2.0
⏰ Gerado em: 13/12/2024 08:00:00
📧 Destinatário: diretoria@arrozbemcasado.com.br

📊 Estatísticas do Monitoramento:
• Fontes consultadas: 7 (DOU, RFB, CONFAZ, SEFAZ, CFC, CPC, Congresso)
• Publicações analisadas: 45
• Publicações relevantes: 5
• Alertas críticos: 3
• Ações obrigatórias: 3
• Oportunidades: 3

💾 Histórico completo disponível em: [Link do Notion]
📞 Dúvidas: fiscal@arrozbemcasado.com.br
```

---

## 🔧 Implementação Técnica

### Configuração do Agente

```typescript
// server/config/fiscalAgentConfig.ts

export const FISCAL_AGENT_CONFIG = {
  name: 'TaxLegislationAgent',
  schedule: '0 8 * * 1-5', // Segunda a sexta, 08:00
  recipient: 'diretoria@arrozbemcasado.com.br',
  cc: ['fiscal@arrozbemcasado.com.br', 'contabilidade@arrozbemcasado.com.br'],
  
  sources: {
    dou: {
      enabled: true,
      url: 'https://www.in.gov.br/',
      frequency: 'daily',
      priority: 'critical'
    },
    rfb: {
      enabled: true,
      url: 'https://www.gov.br/receitafederal/',
      frequency: 'daily',
      priority: 'critical'
    },
    confaz: {
      enabled: true,
      url: 'https://www.confaz.fazenda.gov.br/',
      frequency: 'weekly',
      priority: 'high'
    },
    sefaz: {
      enabled: true,
      states: ['RS', 'SC', 'PR', 'SP', 'MG'],
      frequency: 'weekly',
      priority: 'high'
    },
    cfc: {
      enabled: true,
      url: 'https://cfc.org.br/',
      frequency: 'monthly',
      priority: 'medium'
    },
    cpc: {
      enabled: true,
      url: 'http://www.cpc.org.br/',
      frequency: 'monthly',
      priority: 'medium'
    },
    congress: {
      enabled: true,
      url: 'https://www.congressonacional.leg.br/',
      frequency: 'daily',
      priority: 'critical',
      focus: ['PEC 45', 'reforma tributária']
    }
  },
  
  keywords: {
    critical: [
      'reforma tributária', 'IBS', 'CBS', 'IVA', 'PEC 45',
      'ICMS agronegócio', 'ICMS grãos', 'CONFAZ', 'Convênio ICMS',
      'SPED', 'prazo SPED', 'layout SPED',
      'certificado digital', 'ICP-Brasil',
      'PIS/COFINS agronegócio'
    ],
    high: [
      'Instrução Normativa', 'IN RFB', 'Portaria', 'Decreto',
      'Receita Federal', 'SEFAZ', 'MAPA',
      'DCTF', 'ECF', 'ECD', 'eSocial'
    ],
    medium: [
      'NBC TG', 'CPC', 'ITG', 'norma contábil',
      'IPI', 'Funrural', 'incentivo fiscal'
    ]
  },
  
  filters: {
    products: ['arroz', 'feijão', 'grãos', 'produtos agrícolas'],
    operations: ['produtor rural', 'agroindústria', 'beneficiamento'],
    excludeMarket: true, // Não monitorar cotações
    excludeWeather: true, // Não monitorar clima
    excludeInternational: true // Não monitorar mercado internacional
  },
  
  impact: {
    critical: {
      keywords: ['prazo', 'vencimento', 'obrigatório', 'multa'],
      action: 'immediate',
      notification: 'email + sms'
    },
    high: {
      keywords: ['novo layout', 'alteração', 'mudança'],
      action: 'within_7_days',
      notification: 'email'
    },
    medium: {
      keywords: ['orientação', 'esclarecimento', 'revisão'],
      action: 'within_30_days',
      notification: 'email'
    }
  }
};
```

---

### Código do Agente

```typescript
// server/agents/taxLegislationAgent.ts

import { MCPClient } from '@manus/mcp-client';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { FISCAL_AGENT_CONFIG } from '../config/fiscalAgentConfig';

interface LegislationItem {
  title: string;
  source: 'DOU' | 'RFB' | 'CONFAZ' | 'SEFAZ' | 'CFC' | 'CPC' | 'CONGRESS';
  type: 'law' | 'decree' | 'ordinance' | 'instruction' | 'resolution' | 'agreement';
  number: string;
  publishedAt: Date;
  effectiveAt: Date;
  summary: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
  action: string;
  deadline?: Date;
  url: string;
  fullText?: string;
}

export class TaxLegislationAgent {
  private mcp: MCPClient;
  private config = FISCAL_AGENT_CONFIG;
  
  constructor() {
    this.mcp = new MCPClient({
      servers: {
        gmail: { enabled: true },
        notion: { enabled: true }
      }
    });
  }
  
  async monitorAndSendReport() {
    console.log('[TAX AGENT] Iniciando monitoramento de legislação fiscal...');
    
    // 1. Monitorar DOU
    const douPublications = await this.monitorDOU();
    
    // 2. Monitorar Receita Federal
    const rfbPublications = await this.monitorRFB();
    
    // 3. Monitorar CONFAZ
    const confazPublications = await this.monitorCONFAZ();
    
    // 4. Monitorar SEFAZ (estados prioritários)
    const sefazPublications = await this.monitorSEFAZ();
    
    // 5. Monitorar CFC (normas contábeis)
    const cfcPublications = await this.monitorCFC();
    
    // 6. Monitorar CPC
    const cpcPublications = await this.monitorCPC();
    
    // 7. Monitorar Congresso (reforma tributária)
    const congressUpdates = await this.monitorCongress();
    
    // 8. Consolidar todas as publicações
    const allPublications = [
      ...douPublications,
      ...rfbPublications,
      ...confazPublications,
      ...sefazPublications,
      ...cfcPublications,
      ...cpcPublications,
      ...congressUpdates
    ];
    
    // 9. Filtrar e classificar por impacto
    const relevantPublications = this.filterAndClassify(allPublications);
    
    // 10. Identificar ações obrigatórias
    const mandatoryActions = this.identifyMandatoryActions(relevantPublications);
    
    // 11. Identificar oportunidades
    const opportunities = this.identifyOpportunities(relevantPublications);
    
    // 12. Gerar análise estratégica
    const analysis = this.generateAnalysis({
      publications: relevantPublications,
      actions: mandatoryActions,
      opportunities
    });
    
    // 13. Compilar relatório HTML
    const report = this.compileReport({
      publications: relevantPublications,
      actions: mandatoryActions,
      opportunities,
      analysis
    });
    
    // 14. Salvar no Notion
    await this.saveToNotion(report);
    
    // 15. Enviar por email
    await this.sendEmail(report);
    
    // 16. Enviar SMS para alertas críticos (se houver)
    if (mandatoryActions.some(a => a.impact === 'critical')) {
      await this.sendSMSAlert(mandatoryActions);
    }
    
    console.log('[TAX AGENT] Relatório de legislação fiscal enviado com sucesso');
  }
  
  private async monitorDOU(): Promise<LegislationItem[]> {
    console.log('[TAX AGENT] Monitorando DOU...');
    
    const publications: LegislationItem[] = [];
    
    // Buscar no DOU usando API ou scraping
    const searchQuery = this.buildDOUQuery();
    const results = await this.searchDOU(searchQuery);
    
    for (const result of results) {
      // Verificar se contém palavras-chave relevantes
      if (this.isRelevant(result.title + ' ' + result.summary)) {
        publications.push({
          title: result.title,
          source: 'DOU',
          type: this.identifyType(result.title),
          number: this.extractNumber(result.title),
          publishedAt: result.publishedAt,
          effectiveAt: result.effectiveAt || result.publishedAt,
          summary: result.summary,
          impact: this.assessImpact(result),
          action: this.suggestAction(result),
          deadline: this.extractDeadline(result),
          url: result.url,
          fullText: result.fullText
        });
      }
    }
    
    console.log(`[TAX AGENT] DOU: ${publications.length} publicações relevantes`);
    return publications;
  }
  
  private buildDOUQuery(): string {
    const critical = this.config.keywords.critical.join(' OR ');
    const high = this.config.keywords.high.join(' OR ');
    const products = this.config.filters.products.join(' OR ');
    
    return `(${critical}) AND (${products})`;
  }
  
  private isRelevant(text: string): boolean {
    const allKeywords = [
      ...this.config.keywords.critical,
      ...this.config.keywords.high,
      ...this.config.keywords.medium
    ];
    
    return allKeywords.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  }
  
  private assessImpact(item: any): 'critical' | 'high' | 'medium' | 'low' {
    const text = item.title + ' ' + item.summary;
    
    // Verificar palavras-chave de impacto crítico
    if (this.config.impact.critical.keywords.some(k => text.toLowerCase().includes(k))) {
      return 'critical';
    }
    
    // Verificar palavras-chave de impacto alto
    if (this.config.impact.high.keywords.some(k => text.toLowerCase().includes(k))) {
      return 'high';
    }
    
    // Verificar se é reforma tributária
    if (text.toLowerCase().includes('reforma tributária') || 
        text.toLowerCase().includes('ibs') || 
        text.toLowerCase().includes('cbs')) {
      return 'critical';
    }
    
    return 'medium';
  }
  
  private compileReport(data: any): string {
    // Gerar HTML do relatório focado em legislação
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          h1 { color: #c92a2a; }
          h2 { color: #862e9c; border-bottom: 2px solid #c92a2a; }
          .critical { background: #ffe3e3; border-left: 5px solid #c92a2a; padding: 15px; margin: 15px 0; }
          .high { background: #fff3bf; border-left: 5px solid #f08c00; padding: 15px; margin: 15px 0; }
          .medium { background: #e3f2fd; border-left: 5px solid #1971c2; padding: 15px; margin: 15px 0; }
          .action { background: #d3f9d8; padding: 10px; margin: 10px 0; border-radius: 5px; }
          .deadline { color: #c92a2a; font-weight: bold; }
          table { border-collapse: collapse; width: 100%; margin: 15px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #862e9c; color: white; }
        </style>
      </head>
      <body>
        <h1>⚖️ MONITORAMENTO LEGISLATIVO - FISCAL E CONTÁBIL</h1>
        <p><strong>📅 Data:</strong> ${new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        
        <h2>🔴 ALERTAS CRÍTICOS - AÇÃO IMEDIATA</h2>
        ${this.renderCriticalAlerts(data.actions)}
        
        <h2>📜 DIÁRIO OFICIAL DA UNIÃO</h2>
        ${this.renderDOUPublications(data.publications.filter(p => p.source === 'DOU'))}
        
        <h2>🏛️ RECEITA FEDERAL DO BRASIL</h2>
        ${this.renderRFBPublications(data.publications.filter(p => p.source === 'RFB'))}
        
        <h2>🤝 CONFAZ - CONVÊNIOS E PROTOCOLOS ICMS</h2>
        ${this.renderCONFAZPublications(data.publications.filter(p => p.source === 'CONFAZ'))}
        
        <h2>📊 NORMAS CONTÁBEIS (CFC e CPC)</h2>
        ${this.renderAccountingStandards(data.publications.filter(p => ['CFC', 'CPC'].includes(p.source)))}
        
        <h2>⚖️ REFORMA TRIBUTÁRIA - ACOMPANHAMENTO</h2>
        ${this.renderTaxReform(data.publications.filter(p => p.source === 'CONGRESS'))}
        
        <h2>📊 ANÁLISE ESTRATÉGICA</h2>
        ${this.renderAnalysis(data.analysis)}
        
        <hr>
        <p><small>⚖️ Relatório gerado automaticamente pelo Agente de Legislação Fiscal e Contábil</small></p>
        <p><small>📊 Estatísticas: ${data.publications.length} publicações analisadas | ${data.actions.length} ações obrigatórias | ${data.opportunities.length} oportunidades</small></p>
      </body>
      </html>
    `;
    
    return html;
  }
  
  private async sendEmail(report: string) {
    await this.mcp.gmail.send({
      to: this.config.recipient,
      cc: this.config.cc.join(','),
      subject: `⚖️ Monitoramento Legislativo - ${new Date().toLocaleDateString('pt-BR')}`,
      html: report
    });
  }
  
  private async sendSMSAlert(actions: any[]) {
    const criticalActions = actions.filter(a => a.impact === 'critical');
    
    if (criticalActions.length > 0) {
      const message = `ALERTA CRÍTICO: ${criticalActions.length} ação(ões) obrigatória(s) identificada(s). Verifique email urgentemente.`;
      
      // Enviar SMS (implementar integração com serviço de SMS)
      console.log('[TAX AGENT] SMS Alert:', message);
    }
  }
}
```

---

### Agendamento

```typescript
// server/scheduler.ts

import cron from 'node-cron';
import { TaxLegislationAgent } from './agents/taxLegislationAgent';

const taxAgent = new TaxLegislationAgent();

// Executar de segunda a sexta às 08:00
cron.schedule('0 8 * * 1-5', async () => {
  console.log('[CRON] Iniciando monitoramento de legislação fiscal...');
  
  try {
    await taxAgent.monitorAndSendReport();
    console.log('[CRON] Relatório de legislação fiscal enviado');
  } catch (error) {
    console.error('[CRON] Erro ao monitorar legislação:', error);
    await taxAgent.notifyError(error);
  }
});

console.log('[SCHEDULER] TaxLegislationAgent agendado para 08:00 (seg-sex)');
```

---

## 📊 Métricas de Sucesso

**KPIs do Agente**:
- Taxa de entrega no horário (meta: 100%)
- Número de publicações relevantes identificadas (meta: >3/dia)
- Taxa de alertas críticos (meta: <10%)
- Tempo médio de identificação de mudanças (meta: <24h)
- Taxa de conformidade (meta: 100% - nenhuma obrigação perdida)
- Satisfação da diretoria (meta: >4.5/5)

---

## ✅ Benefícios

### Para a Empresa

✅ **Conformidade Legal**: 100% das mudanças identificadas  
✅ **Redução de Multas**: Alertas antecipados evitam penalidades  
✅ **Economia de Tempo**: Não precisa buscar legislação manualmente  
✅ **Decisões Informadas**: Conhecimento atualizado sobre tributação  
✅ **Aproveitamento de Incentivos**: Identificação de oportunidades  

### Para o Contador

✅ **Tranquilidade**: Nenhuma mudança passa despercebida  
✅ **Produtividade**: Foco em análise, não em busca  
✅ **Profissionalismo**: Sempre atualizado  

### Para a Diretoria

✅ **Visibilidade**: Sabe exatamente o que está mudando  
✅ **Controle**: Ações obrigatórias claramente identificadas  
✅ **Estratégia**: Oportunidades de economia fiscal  

---

**Documento preparado por**: Equipe de Arquitetura Bem Casado  
**Data**: Dezembro 2024  
**Versão**: 1.0
