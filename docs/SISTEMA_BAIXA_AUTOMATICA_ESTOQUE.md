# 📦 Sistema de Baixa Automática de Estoque por Vendas

Documentação completa do sistema de gerenciamento de estoque integrado com vendas da loja online.

---

## 🎯 Visão Geral

O sistema implementa um fluxo completo de **reserva → venda → baixa automática** de estoque, garantindo que:

1. ✅ **Produtos não sejam vendidos** sem estoque disponível
2. ✅ **Múltiplos usuários** não comprem o mesmo produto simultaneamente
3. ✅ **Estoque seja atualizado automaticamente** ao confirmar pagamento
4. ✅ **Cancelamentos devolvam** produtos ao estoque
5. ✅ **Reservas expirem** automaticamente após 15 minutos

---

## 🏗️ Arquitetura

### **Tabelas do Banco de Dados**

#### **1. `stockReservations` (Nova)**

Armazena reservas temporárias de estoque durante o processo de compra.

```sql
CREATE TABLE "stockReservations" (
  "id" SERIAL PRIMARY KEY,
  "productId" INTEGER NOT NULL,
  "storeId" INTEGER NOT NULL,
  "orderId" INTEGER,
  "quantity" INTEGER NOT NULL,
  "status" reservation_status DEFAULT 'active',
  "expiresAt" TIMESTAMP NOT NULL,
  "completedAt" TIMESTAMP,
  "cancelledAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

**Status possíveis**:
- `active` - Reserva ativa (aguardando confirmação)
- `completed` - Venda confirmada, estoque baixado
- `cancelled` - Pedido cancelado, estoque devolvido
- `expired` - Reserva expirou (15 min)

#### **2. `stockMovements` (Atualizada)**

Novos tipos de movimentação adicionados:

- `sale` - Baixa por venda confirmada
- `sale_cancellation` - Devolução por cancelamento

---

## 🔄 Fluxo Completo de Venda

### **Fase 1: Adicionar ao Carrinho**

```typescript
// Frontend: Ao adicionar produto ao carrinho
const result = await trpc.sales.checkAvailability.query({
  productId: 1,
  storeId: 1,
  quantity: 5
});

if (!result.isAvailable) {
  alert(`Apenas ${result.available} unidades disponíveis!`);
  return;
}

// Adiciona ao carrinho (sem reservar ainda)
```

---

### **Fase 2: Criar Pedido (Reserva)**

```typescript
// Frontend: Ao finalizar pedido
const reservations = [];

for (const item of cartItems) {
  const result = await trpc.sales.createReservation.mutate({
    productId: item.productId,
    storeId: 1,
    quantity: item.quantity,
    orderId: undefined // Ainda não tem orderId
  });
  
  if (!result.success) {
    alert(result.error);
    // Cancelar reservas já criadas
    return;
  }
  
  reservations.push(result.reservationId);
}

// Criar pedido no banco
const order = await trpc.orders.create.mutate({
  customerName,
  items,
  // ...
});

// Atualizar reservas com orderId
for (const reservationId of reservations) {
  await db.update(stockReservations)
    .set({ orderId: order.orderId })
    .where(eq(stockReservations.id, reservationId));
}
```

**O que acontece**:
1. ✅ Estoque é **reservado** (não pode ser vendido para outros)
2. ✅ Reserva expira em **15 minutos** se não confirmar
3. ✅ Cliente tem tempo para pagar sem perder o produto

---

### **Fase 3: Confirmar Pagamento (Baixa Automática)**

```typescript
// Backend: Ao confirmar pagamento (PIX, cartão, etc)
const result = await trpc.sales.confirmSale.mutate({
  orderId: 123,
  reservationIds: [1, 2, 3]
});

if (result.success) {
  console.log('Estoque atualizado automaticamente!');
}
```

**O que acontece**:
1. ✅ **Estoque físico é reduzido** (productStocks.quantity -= reserved)
2. ✅ **Movimentação registrada** (stockMovements tipo "sale")
3. ✅ **Reserva marcada como "completed"**
4. ✅ **Auditoria completa** (quem, quando, quanto)

---

### **Fase 4: Cancelamento (Devolução)**

```typescript
// Backend: Ao cancelar pedido
const result = await trpc.sales.cancelSale.mutate({
  orderId: 123,
  reason: 'Cliente solicitou cancelamento'
});

if (result.success) {
  console.log('Estoque devolvido!');
}
```

**O que acontece**:
1. ✅ **Estoque físico é aumentado** (productStocks.quantity += reserved)
2. ✅ **Movimentação registrada** (stockMovements tipo "sale_cancellation")
3. ✅ **Reserva marcada como "cancelled"**

---

### **Fase 5: Limpeza de Reservas Expiradas**

```typescript
// Executar via cron a cada 5 minutos
cron.schedule('*/5 * * * *', async () => {
  const result = await trpc.sales.cleanExpiredReservations.mutate();
  console.log(`${result.cleaned} reservas expiradas limpas`);
});
```

**O que acontece**:
1. ✅ Busca reservas com `status='active'` e `expiresAt < now`
2. ✅ Marca como `status='expired'`
3. ✅ **Não devolve ao estoque** (nunca foi baixado)

---

## 📊 Cálculo de Estoque Disponível

**Fórmula**:

```
Estoque Disponível = Estoque Físico - Reservas Ativas
```

**Exemplo**:

```
Produto: Arroz Bem Casado 5kg
Estoque Físico: 100 unidades
Reservas Ativas: 15 unidades (5 pedidos em andamento)
Estoque Disponível: 85 unidades
```

**Implementação**:

```typescript
async function getAvailableStock(productId: number, storeId: number): Promise<number> {
  // Buscar estoque físico
  const stock = await db.query.productStocks.findFirst({
    where: and(
      eq(productStocks.productId, productId),
      eq(productStocks.storeId, storeId)
    )
  });
  
  if (!stock) return 0;
  
  // Buscar reservas ativas (não expiradas)
  const now = new Date();
  const reservations = await db.query.stockReservations.findMany({
    where: and(
      eq(stockReservations.productId, productId),
      eq(stockReservations.storeId, storeId),
      eq(stockReservations.status, 'active'),
      sql`${stockReservations.expiresAt} > ${now}`
    )
  });
  
  const reservedQty = reservations.reduce((sum, r) => sum + r.quantity, 0);
  
  return Math.max(0, stock.quantity - reservedQty);
}
```

---

## 🔐 Validações e Segurança

### **1. Validação de Estoque Disponível**

```typescript
// Antes de criar reserva
const available = await getAvailableStock(productId, storeId);

if (available < quantity) {
  throw new Error(`Estoque insuficiente. Disponível: ${available}`);
}
```

### **2. Proteção Contra Condição de Corrida**

```typescript
// Usar transações do banco de dados
await db.transaction(async (tx) => {
  // 1. Verificar estoque
  const available = await getAvailableStock(productId, storeId);
  
  if (available < quantity) {
    throw new Error('Estoque insuficiente');
  }
  
  // 2. Criar reserva
  await tx.insert(stockReservations).values({
    productId,
    storeId,
    quantity,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000)
  });
});
```

### **3. Validação de Expiração**

```typescript
// Ao confirmar venda, verificar se reserva não expirou
const reservation = await db.query.stockReservations.findFirst({
  where: eq(stockReservations.id, reservationId)
});

if (reservation.expiresAt < new Date()) {
  throw new Error('Reserva expirada. Refaça o pedido.');
}
```

---

## 🎨 Integração no Frontend

### **1. Verificar Disponibilidade ao Adicionar ao Carrinho**

```typescript
// client/src/contexts/CartContext.tsx

const addToCart = async (product: Product, quantity: number) => {
  // Verificar disponibilidade
  const result = await trpc.sales.checkAvailability.query({
    productId: product.id,
    storeId: 1, // Loja atual
    quantity
  });
  
  if (!result.isAvailable) {
    toast.error(`Apenas ${result.available} unidades disponíveis!`);
    return;
  }
  
  // Adicionar ao carrinho
  setCart(prev => [...prev, { product, quantity }]);
  toast.success('Produto adicionado ao carrinho!');
};
```

### **2. Criar Reservas ao Finalizar Pedido**

```typescript
// client/src/pages/Checkout.tsx

const handleCheckout = async () => {
  try {
    // 1. Criar reservas
    const reservations = [];
    
    for (const item of cart) {
      const result = await trpc.sales.createReservation.mutate({
        productId: item.product.id,
        storeId: 1,
        quantity: item.quantity
      });
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      reservations.push(result.reservationId);
    }
    
    // 2. Criar pedido
    const order = await trpc.orders.create.mutate({
      customerName,
      customerPhone,
      items: cart.map(item => ({
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.product.price
      }))
    });
    
    // 3. Redirecionar para pagamento
    router.push(`/payment/${order.orderId}`);
    
  } catch (error) {
    toast.error(error.message);
  }
};
```

### **3. Confirmar Venda ao Pagar**

```typescript
// client/src/pages/Payment.tsx

const handlePaymentSuccess = async () => {
  try {
    // Confirmar venda e baixar estoque
    const result = await trpc.sales.confirmSale.mutate({
      orderId,
      reservationIds
    });
    
    if (result.success) {
      toast.success('Pagamento confirmado! Estoque atualizado.');
      router.push(`/order-success/${orderId}`);
    }
    
  } catch (error) {
    toast.error('Erro ao confirmar pagamento');
  }
};
```

### **4. Mostrar Estoque Disponível em Tempo Real**

```typescript
// client/src/components/ProductCard.tsx

const ProductCard = ({ product }: { product: Product }) => {
  const { data: availability } = trpc.sales.checkAvailability.useQuery({
    productId: product.id,
    storeId: 1,
    quantity: 1
  });
  
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>R$ {(product.price / 100).toFixed(2)}</p>
      
      {availability && (
        <div className="stock-info">
          {availability.available > 0 ? (
            <span className="text-green-600">
              ✅ {availability.available} disponíveis
            </span>
          ) : (
            <span className="text-red-600">
              ❌ Sem estoque
            </span>
          )}
        </div>
      )}
      
      <button 
        onClick={() => addToCart(product, 1)}
        disabled={!availability?.isAvailable}
      >
        Adicionar ao Carrinho
      </button>
    </div>
  );
};
```

---

## ⏰ Agendamento de Tarefas

### **Limpeza de Reservas Expiradas**

```typescript
// server/scheduler.ts

import cron from 'node-cron';
import { trpc } from './routers';

// Executar a cada 5 minutos
cron.schedule('*/5 * * * *', async () => {
  console.log('[CRON] Limpando reservas expiradas...');
  
  try {
    const result = await trpc.sales.cleanExpiredReservations.mutate();
    console.log(`[CRON] ${result.cleaned} reservas expiradas limpas`);
  } catch (error) {
    console.error('[CRON] Erro ao limpar reservas:', error);
  }
});

console.log('[SCHEDULER] Cron de limpeza de reservas configurado (*/5 * * * *)');
```

---

## 📊 Estatísticas e Monitoramento

### **Dashboard de Reservas**

```typescript
// Endpoint para visualizar reservas ativas
const stats = await trpc.sales.getReservationStats.query({
  storeId: 1
});

console.log(`Reservas ativas: ${stats.activeCount}`);
console.log(`Total reservado: ${stats.totalReserved} unidades`);
console.log(`Produtos com reservas:`, stats.reservations);
```

### **Relatório de Vendas e Estoque**

```sql
-- Vendas do dia com baixa de estoque
SELECT 
  p.name AS produto,
  SUM(sm.quantity) AS quantidade_vendida,
  ps.quantity AS estoque_atual
FROM stockMovements sm
JOIN products p ON p.id = sm.productId
JOIN productStocks ps ON ps.productId = p.id AND ps.storeId = sm.storeId
WHERE 
  sm.movementType = 'sale'
  AND sm.createdAt >= CURRENT_DATE
GROUP BY p.id, p.name, ps.quantity
ORDER BY quantidade_vendida DESC;
```

---

## ✅ Benefícios do Sistema

1. ✅ **Evita overselling** (vender mais do que tem)
2. ✅ **Sincronização em tempo real** (estoque sempre atualizado)
3. ✅ **Auditoria completa** (quem, quando, quanto, por quê)
4. ✅ **Proteção contra condição de corrida** (múltiplos usuários)
5. ✅ **Experiência do usuário** (sabe se tem estoque antes de pagar)
6. ✅ **Cancelamento seguro** (devolve ao estoque automaticamente)
7. ✅ **Limpeza automática** (reservas expiradas não travam estoque)

---

## 🔧 Manutenção e Troubleshooting

### **Problema: Reservas não estão expirando**

**Causa**: Cron job não está rodando

**Solução**:
```bash
# Verificar se o scheduler está ativo
ps aux | grep node

# Executar manualmente
curl -X POST http://localhost:3000/api/sales/cleanExpiredReservations
```

### **Problema: Estoque negativo**

**Causa**: Baixa sem validação ou bug na lógica

**Solução**:
```sql
-- Verificar estoques negativos
SELECT * FROM productStocks WHERE quantity < 0;

-- Corrigir manualmente
UPDATE productStocks SET quantity = 0 WHERE quantity < 0;
```

### **Problema: Reserva não foi completada**

**Causa**: Erro ao confirmar pagamento

**Solução**:
```typescript
// Cancelar reserva manualmente
await trpc.sales.cancelReservation.mutate({
  reservationId: 123,
  reason: 'Erro no pagamento'
});
```

---

## 📝 Próximas Melhorias

- [ ] **Reserva inteligente**: Priorizar clientes VIP
- [ ] **Notificação de estoque baixo**: Email quando estoque < 10
- [ ] **Previsão de demanda**: ML para prever vendas
- [ ] **Reserva por tempo variável**: 5 min para produtos populares, 30 min para outros
- [ ] **Dashboard visual**: Gráficos de reservas em tempo real

---

**Status**: ✅ Sistema de Baixa Automática 100% implementado e pronto para uso!
