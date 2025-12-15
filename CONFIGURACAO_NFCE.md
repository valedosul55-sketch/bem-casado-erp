# Configuração Completa da NFC-e - Bem Casado Alimentos

## 📋 Dados da Empresa

### Identificação
- **Razão Social:** INDÚSTRIA E COMERCIO DE ALIMENTOS BEM CASADO LTDA
- **Nome Fantasia:** BEM CASADO ALIMENTOS
- **CNPJ:** 14.295.537/0001-30
- **Inscrição Estadual:** 645.342.314.116
- **Inscrição Municipal:** 304129
- **CNAE:** 4632003
- **Regime Tributário:** Lucro Real (código 1)

### Endereço Completo
- **Tipo de Logradouro:** Estrada Municipal
- **Logradouro:** Santo Antônio do Alto
- **Número:** 257
- **Complemento:** COND: CAPAO GROSSO II
- **Bairro:** Parque Novo Horizonte
- **Município:** São José dos Campos
- **UF:** SP
- **CEP:** 12.225-810

### Contato
- **Telefone:** (12) 98194-9314
- **Email para Notificações:** controladoria@arrozvaledosul.com.br

---

## 🔐 Credenciais Focus NFe

### Ambiente de Homologação
- **Token API:** BtkEw8Pzty7cvp2EMreGClE37QTRYP4z
- **Ambiente:** homologacao
- **Base URL:** https://homologacao.focusnfe.com.br

### Credenciais CSC (Código de Segurança do Contribuinte)
- **CSC (Token):** 64ec579e-65eb-48f9-b2ef-42fc57984476
- **ID do Token:** 000001

> ⚠️ **IMPORTANTE:** O CSC é **obrigatório** para emissão de NFC-e. Sem ele, a nota não será autorizada pela SEFAZ.

### Certificado Digital
- **Tipo:** A1
- **Senha:** 1234
- **Validade:** 28/08/2026
- **Status:** ✅ Válido e cadastrado no Focus NFe

---

## 📊 Parametrização Fiscal dos Produtos

### Arroz Branco Tipo 1 e Arroz Integral Tipo 1
- **NCM:** 10063021
- **CEST:** Não se aplica (sem ST)
- **Tributação:**
  * **CST 040 (Isento):** Para vendas sem CPF/CNPJ, com CPF, ou CNPJ sem IE
  * **CST 020 (Base Reduzida):** Para CNPJ com Inscrição Estadual (contribuinte ICMS)
    - Base de cálculo: 38.89% do valor (redução de 61.11%)
    - Alíquota: 18% sobre a base
    - ICMS efetivo: 7% do valor total

### Feijão Carioca Tipo 1 e Feijão Preto Tipo 1
- **NCM:** 07133399
- **CEST:** Não se aplica (sem ST)
- **Tributação:** Mesma lógica do arroz (CST 040 ou CST 020)

### Açúcar Cristal
- **NCM:** 17019900
- **CEST:** 17.101.00 (obrigatório para produtos com ST)
- **Tributação:**
  * **CST 060:** ICMS cobrado anteriormente por Substituição Tributária
  * **Sem destaque de ICMS:** O imposto já foi recolhido na origem (indústria)
  * **Aplicação:** Todas as vendas (consumidor final e revenda)

---

## 🎯 Regras de Negócio

### Determinação do CST por Produto

#### Açúcar (NCM 17019900)
```
SEMPRE CST 060
- Motivo: Substituição Tributária
- ICMS: Já recolhido na origem
- CEST: 17.101.00 (obrigatório)
```

#### Arroz e Feijão (NCM 10063021 e 07133399)
```
SE (sem CPF/CNPJ OU com CPF OU CNPJ sem IE):
  → CST 040 (Isento)
  → Sem cálculo de ICMS

SE (CNPJ com Inscrição Estadual):
  → CST 020 (Base Reduzida)
  → Base de cálculo: valor × 0.3889
  → Alíquota: 18%
  → ICMS: valor × 0.3889 × 0.18 = valor × 0.07
```

### Campos Obrigatórios da NFC-e

1. **Emitente:**
   - CNPJ
   - Inscrição Estadual
   - Nome/Razão Social
   - Endereço completo
   - CNAE
   - Regime Tributário

2. **Operação:**
   - Natureza da operação
   - Modalidade de frete (9 = sem frete)
   - Presença do comprador (1 = presencial)
   - Consumidor final (1 = sim)

3. **Itens:**
   - Código NCM
   - CFOP (5102 = venda interna)
   - CST (situação tributária)
   - CEST (quando aplicável)
   - Valores e quantidades

4. **Pagamento:**
   - Forma de pagamento
   - Valor

---

## ✅ Status Atual

### Configurações Implementadas
- ✅ Dados completos da empresa no payload da NFC-e
- ✅ Inscrição Estadual 645.342.314.116
- ✅ Endereço completo (Estrada Municipal Santo Antônio do Alto, 257)
- ✅ CSC e ID do Token configurados como variáveis de ambiente
- ✅ Lógica de tributação diferenciada por produto
- ✅ CST 060 para açúcar (ST)
- ✅ CST 040/020 para arroz e feijão (conforme contribuinte)
- ✅ CEST 17.101.00 apenas para açúcar
- ✅ Testes automatizados validando configurações

### Pendências
- ⏳ Cadastro do CNPJ 14.295.537/0001-30 na SEFAZ-SP (ambiente de homologação)
- ⏳ Teste de emissão real após cadastro na SEFAZ

---

## 🚀 Próximos Passos

1. **Solicitar Cadastro na SEFAZ-SP (Homologação)**
   - Acessar portal da SEFAZ-SP
   - Fazer credenciamento para NFC-e
   - Aguardar aprovação (2-5 dias úteis)

2. **Testar Emissão em Homologação**
   - Fazer venda teste no PDV
   - Validar CST corretos por produto
   - Verificar CEST apenas no açúcar
   - Confirmar cálculos de ICMS

3. **Migrar para Produção**
   - Alterar `FOCUS_NFE_ENV` de "homologacao" para "production"
   - Fazer primeira venda real
   - Validar DANFE e XML

---

## 📞 Suporte

**Focus NFe:**
- Documentação: https://focusnfe.com.br/doc/
- Suporte: suporte@acras.com.br

**SEFAZ-SP:**
- Portal NFC-e: https://www.fazenda.sp.gov.br/nfe/
- Credenciamento: https://www.fazenda.sp.gov.br/nfe/credenciamento/

---

**Última atualização:** 02/12/2025
**Responsável:** Sistema Manus AI
