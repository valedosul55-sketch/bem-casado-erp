# Análise da NFC-e Real da BEM CASADO

## Dados da Empresa
- **Razão Social**: INDUSTRIA E COMERCIO DE ALIMENTOS BEM CASADO LTDA
- **CNPJ**: 14.295.537/0001-30
- **IE**: 645342314116
- **Endereço**: SANTO ANTONIO DO ALTO, 257, PARQUE NOVO HORIZONTE, SAO JOSE DOS CAMPOS - SP

## Produtos da NFC-e

### Produto 1
- **Código**: 7896285902169
- **Descrição**: ARROZ BRANCO POLIDO AGULHINHA TIPO 1 BEM CASADO
- **Quantidade**: 1,0000 PT
- **Valor Unitário**: R$ 23,50
- **Valor Total**: R$ 23,50

### Produto 2
- **Código**: 7896285902015
- **Descrição**: FEIJÃO BENEFICIADO CLASSE CORES (CARIOCA) TIPO 1 BEM CASADO
- **Quantidade**: 1,0000 PT
- **Valor Unitário**: R$ 39,90
- **Valor Total**: R$ 39,90

### Produto 3
- **Código**: 7896285902046
- **Descrição**: ARROZ BENEFICIADO INTEGRAL TIPO 1 BEM CASADO
- **Quantidade**: (não visível)
- **Valor Unitário**: (não visível)
- **Valor Total**: (não visível)

## Observações Importantes

1. **Todos os produtos são da cesta básica** (arroz e feijão)
2. **Tributação aplicável**: Base reduzida de 61,11% (base tributável 38,89%), alíquota 18%, resultando em 7% efetivo
3. **Regime tributário**: Lucro Real (CST 20 - com redução de base de cálculo)

## Próximos Passos

Para implementar corretamente no sistema:

1. ✅ Usar CST 20 (com redução de base de cálculo)
2. ✅ Base de cálculo = Valor × 38,89%
3. ✅ Alíquota ICMS = 18%
4. ✅ Valor ICMS = Base × 18% (equivale a 7% do valor original)
5. ✅ Percentual de redução = 61,11%

## Cálculo de Exemplo

Para o Arroz Branco (R$ 23,50):
- Base de cálculo: 23,50 × 38,89% = R$ 9,14
- ICMS: 9,14 × 18% = R$ 1,64
- Verificação: 1,64 / 23,50 = 6,98% ≈ 7% ✓

Para o Feijão (R$ 39,90):
- Base de cálculo: 39,90 × 38,89% = R$ 15,52
- ICMS: 15,52 × 18% = R$ 2,79
- Verificação: 2,79 / 39,90 = 6,99% ≈ 7% ✓
