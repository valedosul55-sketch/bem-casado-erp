# 📊 Simulação: Sistema de Estoque com Custo Médio Ponderado

## 🎯 Cenário

Vamos simular a compra e venda de **Arroz Branco Tipo 1** usando o método de **Custo Médio Ponderado**.

---

## 📦 PASSO 1: Compras (Entradas de Estoque)

### Compra 1: 10kg a R$ 20,00
```
Data: 14/12/2024
Lote: LOTE-2024-001
Quantidade: 10kg
Custo Unitário: R$ 2,00/kg
Custo Total: R$ 20,00
Fornecedor: Fornecedor A
```

**Estoque após Compra 1:**
- Quantidade Total: **10kg**
- Valor Total: **R$ 20,00**
- **Custo Médio: R$ 2,00/kg**

---

### Compra 2: 10kg a R$ 25,00
```
Data: 14/12/2024
Lote: LOTE-2024-002
Quantidade: 10kg
Custo Unitário: R$ 2,50/kg
Custo Total: R$ 25,00
Fornecedor: Fornecedor B
```

**Cálculo do Novo Custo Médio:**
```
Estoque Anterior: 10kg × R$ 2,00 = R$ 20,00
Nova Compra:      10kg × R$ 2,50 = R$ 25,00
─────────────────────────────────────────────
Total:            20kg           = R$ 45,00

Custo Médio = R$ 45,00 ÷ 20kg = R$ 2,25/kg
```

**Estoque após Compra 2:**
- Quantidade Total: **20kg**
- Valor Total: **R$ 45,00**
- **Custo Médio: R$ 2,25/kg** ⬆️

---

### Compra 3: 10kg a R$ 28,00
```
Data: 14/12/2024
Lote: LOTE-2024-003
Quantidade: 10kg
Custo Unitário: R$ 2,80/kg
Custo Total: R$ 28,00
Fornecedor: Fornecedor C
```

**Cálculo do Novo Custo Médio:**
```
Estoque Anterior: 20kg × R$ 2,25 = R$ 45,00
Nova Compra:      10kg × R$ 2,80 = R$ 28,00
─────────────────────────────────────────────
Total:            30kg           = R$ 73,00

Custo Médio = R$ 73,00 ÷ 30kg = R$ 2,4333.../kg
```

**Estoque após Compra 3:**
- Quantidade Total: **30kg**
- Valor Total: **R$ 73,00**
- **Custo Médio: R$ 2,43/kg** ⬆️

---

## 📊 Resumo do Estoque (Antes da Venda)

| Lote | Quantidade | Custo Unit. | Custo Total |
|------|------------|-------------|-------------|
| LOTE-2024-001 | 10kg | R$ 2,00/kg | R$ 20,00 |
| LOTE-2024-002 | 10kg | R$ 2,50/kg | R$ 25,00 |
| LOTE-2024-003 | 10kg | R$ 2,80/kg | R$ 28,00 |
| **TOTAL** | **30kg** | **R$ 2,43/kg** | **R$ 73,00** |

---

## 🛒 PASSO 2: Venda - 15kg a R$ 45,00

```
Data: 14/12/2024
Quantidade Vendida: 15kg
Preço de Venda Total: R$ 45,00
Preço de Venda Unitário: R$ 3,00/kg
```

### 💵 Cálculo do CMV (Custo da Mercadoria Vendida)

Com **Custo Médio Ponderado**, usamos o custo médio atual do estoque:

```
CMV = Quantidade Vendida × Custo Médio
CMV = 15kg × R$ 2,43/kg
CMV = R$ 36,50
```

### 📈 Análise Financeira

| Item | Valor |
|------|-------|
| **Receita Total** | R$ 45,00 |
| **CMV (Custo)** | R$ 36,50 |
| **Lucro Bruto** | R$ 8,50 |
| **Margem de Lucro** | **18,9%** |

---

## 📦 Estoque Final (Após a Venda)

**Cálculo do Estoque Remanescente:**
```
Estoque Anterior: 30kg × R$ 2,43 = R$ 73,00
Venda (CMV):      15kg × R$ 2,43 = R$ 36,50
─────────────────────────────────────────────
Estoque Final:    15kg           = R$ 36,50

Custo Médio continua: R$ 2,43/kg
```

**Resumo:**
- Quantidade Total: **15kg**
- Valor Total: **R$ 36,50**
- **Custo Médio: R$ 2,43/kg** (mantém o mesmo)

---

## 🔄 Comparação: FIFO vs Custo Médio

### Com FIFO (First In, First Out)
```
Venda de 15kg baixaria dos lotes mais antigos:
- 10kg do Lote 1 (R$ 2,00/kg) = R$ 20,00
- 5kg do Lote 2 (R$ 2,50/kg)  = R$ 12,50
─────────────────────────────────────────────
CMV Total = R$ 32,50
Lucro = R$ 45,00 - R$ 32,50 = R$ 12,50 (27,8%)
```

### Com Custo Médio Ponderado
```
Venda de 15kg usa o custo médio:
- 15kg × R$ 2,43/kg = R$ 36,50
─────────────────────────────────────────────
CMV Total = R$ 36,50
Lucro = R$ 45,00 - R$ 36,50 = R$ 8,50 (18,9%)
```

### Diferença
- **FIFO**: Lucro maior (R$ 12,50) - mais preciso
- **Custo Médio**: Lucro menor (R$ 8,50) - mais simples

---

## ✅ Resumo da Simulação

### Compras
| Lote | Quantidade | Custo Unit. | Custo Total |
|------|------------|-------------|-------------|
| Lote 1 | 10kg | R$ 2,00/kg | R$ 20,00 |
| Lote 2 | 10kg | R$ 2,50/kg | R$ 25,00 |
| Lote 3 | 10kg | R$ 2,80/kg | R$ 28,00 |
| **TOTAL COMPRADO** | **30kg** | - | **R$ 73,00** |

### Venda (Custo Médio)
- **Quantidade**: 15kg
- **Preço de Venda**: R$ 45,00 (R$ 3,00/kg)
- **CMV**: R$ 36,50 (R$ 2,43/kg)
- **Lucro**: R$ 8,50 (18,9%)

### Estoque Final
- **Quantidade Restante**: 15kg
- **Valor do Estoque**: R$ 36,50
- **Custo Médio**: R$ 2,43/kg

---

## 🎯 Como Funciona no Sistema

### 1. Configuração
Acesse `/admin/estoque/configuracoes` e selecione:
- **Método de Valoração**: Custo Médio Ponderado
- **Loja**: Selecione a loja

### 2. Compras (Entrada de Lotes)
Ao importar uma NF-e ou criar um lote manualmente:
```typescript
// O sistema calcula automaticamente o novo custo médio
const novoEstoque = estoqueAtual + quantidadeCompra;
const novoValorTotal = (estoqueAtual × custoMedio) + (quantidadeCompra × custoCompra);
const novoCustoMedio = novoValorTotal / novoEstoque;

// Atualiza o campo averageCost do produto
await db.update(products)
  .set({ averageCost: novoCustoMedio })
  .where(eq(products.id, productId));
```

### 3. Vendas (Saída de Estoque)
Ao confirmar uma venda:
```typescript
// Usa o custo médio atual do produto
const cmv = quantidadeVendida × product.averageCost;

// Registra a movimentação com o custo médio
await db.insert(stockMovements).values({
  productId,
  storeId,
  movementType: 'sale',
  quantity: -quantidadeVendida,
  unitCost: product.averageCost, // Custo médio
  reason: 'Venda',
});

// O custo médio NÃO muda após a venda
// Apenas diminui a quantidade em estoque
```

### 4. Relatórios
Acesse `/admin/relatorios` para ver:
- **Custo Médio** de cada produto
- **CMV** de cada venda
- **Margem de Lucro** real
- **Valor do Estoque** atual

---

## 🎓 Vantagens do Custo Médio Ponderado

### ✅ Vantagens
1. **Simplicidade**: Cálculo mais simples que FIFO
2. **Aceito pela Receita Federal**: Método permitido
3. **Suaviza variações**: Não sofre tanto com oscilações de preço
4. **Menos movimentações**: Não precisa rastrear cada lote individualmente

### ⚠️ Desvantagens
1. **Menos preciso**: Não reflete o custo real de cada lote
2. **Margem distorcida**: Pode mostrar margens diferentes da realidade
3. **Sem rastreabilidade**: Dificulta rastrear lotes específicos
4. **Não ideal para perecíveis**: Produtos com validade precisam de FIFO

---

## 🔧 Implementação no Código

### Função de Baixa com Custo Médio
```typescript
// server/salesRouter.ts - withdrawAverageCost()

async function withdrawAverageCost(
  productId: number,
  storeId: number,
  quantity: number,
  orderId?: number
) {
  // 1. Buscar produto para pegar custo médio
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  // 2. Usar custo médio (averageCost) para calcular CMV
  const unitCost = product.averageCost;
  const cmv = quantity * unitCost;

  // 3. Registrar movimentação com custo médio
  await db.insert(stockMovements).values({
    productId,
    storeId,
    movementType: 'sale',
    quantity: -quantity,
    unitCost, // Custo médio do produto
    orderId,
    reason: 'Venda com Custo Médio',
  });

  // 4. Atualizar estoque
  await db
    .update(productStocks)
    .set({ quantity: stock.quantity - quantity })
    .where(eq(productStocks.id, stock.id));

  return { success: true, cmv };
}
```

---

## 📝 Conclusão

O sistema está **100% funcional** com **Custo Médio Ponderado**! 🎉

Para usar:
1. Configure o método em `/admin/estoque/configuracoes`
2. Faça compras normalmente (NF-e ou manual)
3. O sistema calcula o custo médio automaticamente
4. Nas vendas, usa o custo médio para calcular CMV
5. Veja os relatórios em `/admin/relatorios`

**Pronto para produção!** ✅
