# Parametrização Fiscal - Açúcar Cristal

## Dados Extraídos do Revisor Tributário Econet

### Produto
- **NCM:** 1701.99.00
- **Descrição:** Ex 01 - Sacarose quimicamente pura
- **CEST:** 17.101.00

### IPI
- **Situação:** Não sujeito à incidência do IPI
- **Base Legal:** Artigo 24 do RIPI/2010

### PIS/COFINS
- **PIS:** 0,00% (Alíquota Zero)
- **COFINS:** 0,00% (Alíquota Zero)
- **Base Legal:** Artigo 1º, inciso XXII, da Lei nº 10.925/2004

### ICMS
- **Alíquota Regra Geral:** 18%
- **Base Legal:** Artigo 52, inciso I, do RICMS/SP

### ICMS - Redução de Base de Cálculo
- **Benefício:** Redução de Base de Cálculo
- **Descrição:** Alimentos: Açúcares e produtos de confeitaria
- **Redução:** Carga tributária de 12,00%
- **Crédito:** Mantém Crédito
- **NCM:** 17
- **Base Legal:** Artigo 39, inciso X, do Anexo II do RICMS/SP
- **Ato Inicial:** Decreto 63.320/2018
- **Vigência:** De 01/12/2004

**APLICABILIDADE:**
Aplica-se nas operações realizadas por estabelecimento fabricante ou atacadista.

**OBSERVAÇÃO:**
O Comunicado CAT nº 07/2017 esclarece sobre a aplicação da redução da base de cálculo em relação às saídas internas realizadas por estabelecimentos atacadistas.

A redução não se aplica às operações destinadas a contribuintes optantes pelo Simples Nacional ou a consumidor final (artigo 39, § 1º, item 2, alínea "a", do Anexo II do RICMS/SP).

O benefício aplica-se somente ao produto destinado à alimentação humana.

### ICMS ST (Substituição Tributária)
- **Segmento:** Produtos alimentícios
- **CEST:** 17.101.00
- **Substituição Tributária:** DEPENDE

**Item passível de sujeição à substituição tributária**, sendo necessário analisar se a NCM e a descrição do produto comercializado são as mesmas constantes no Convênio ICMS nº 142/2018.

**NCM (Convênio ICMS 142/2018):** 1701.99.00

**Descrição (Convênio ICMS 142/2018):**
Açúcar cristal, em embalagens de conteúdo inferior ou igual a 2 kg, exceto as embalagens contendo envelopes individualizados (sachês) de conteúdo inferior ou igual a 10 g

**Margem de Valor Agregado (MVA):** 40,62%

**ALERTA:**
O CEST deverá ser indicado na nota fiscal

**Base Legal:** Artigo 313-W do RICMS/SP; Portaria SRE nº 43/2023

---

## Resumo para Implementação

### Para Açúcar Cristal (embalagens até 2kg):

**Quando aplicar ST (CST 10):**
- Operação realizada por fabricante ou atacadista
- Destinatário: Varejo
- Regime: Substituição Tributária

**Quando NÃO aplicar ST:**
- Destinatário: Consumidor final (CST 040 - Isento)
- Destinatário: Optante pelo Simples Nacional

**Cálculos para CST 10:**

1. **ICMS Próprio:**
   - Base de Cálculo: Valor da operação × 66,67% (redução de 33,33% para carga de 12%)
   - Alíquota: 18%
   - Valor ICMS: BC × 18% = Valor × 12%

2. **ICMS ST:**
   - Base de Cálculo ST: Valor da operação × (1 + MVA 40,62%)
   - Alíquota ST: 18%
   - Valor ICMS ST: (BC ST × 18%) - ICMS Próprio


---

## ATUALIZAÇÃO - Venda ao Consumidor Final

### CST Correto: 060

**CST 060** - ICMS cobrado anteriormente por substituição tributária

**Significado:**
O ICMS já foi recolhido anteriormente pelo fornecedor/fabricante através do regime de Substituição Tributária. Portanto, na venda ao consumidor final:

- ✅ **Não há destaque de ICMS** na nota
- ✅ **Não há cálculo de ICMS** (valor = 0)
- ✅ **Apenas informar CST 060**

### Implementação para NFC-e:

```
icms_situacao_tributaria: '60'
icms_origem: '0'
// Sem campos de base de cálculo, alíquota ou valor
// O ICMS já foi recolhido na origem
```

### Resumo Final da Tributação:

| Produto | CST | ICMS | Observação |
|---------|-----|------|------------|
| **Açúcar Cristal** | 060 | Sem destaque | ICMS já recolhido por ST na origem |
| **Arroz (Branco/Integral)** | 040 ou 020 | Isento ou 7% | Depende se é contribuinte ICMS |
| **Feijão (Carioca/Preto)** | 040 ou 020 | Isento ou 7% | Depende se é contribuinte ICMS |
