# 🎨 Guia de Integração Frontend - Sistema de Baixa Automática

Documentação completa para integrar o sistema de baixa automática de estoque no frontend da loja online.

---

## 📦 Arquivos Criados

### **1. Hooks**

#### `client/src/hooks/useStockAvailability.ts`
Hook para verificar disponibilidade de estoque em tempo real.

**Uso básico**:
```typescript
import { useStockAvailability } from '@/hooks/useStockAvailability';

const { available, isAvailable, isLoading } = useStockAvailability({
  productId: 1,
  storeId: 1,
  quantity: 5
});

// available: 85 (unidades disponíveis)
// isAvailable: true (tem estoque para a quantidade solicitada)
// isLoading: false
```

**Recursos**:
- ✅ Atualização automática a cada 30 segundos
- ✅ Atualização ao focar na janela
- ✅ Cache inteligente (10 segundos)
- ✅ Suporte a múltiplos produtos (`useMultipleStockAvailability`)

---

#### `client/src/hooks/useStockReservation.ts`
Hook para gerenciar reservas de estoque.

**Uso básico**:
```typescript
import { useStockReservation } from '@/hooks/useStockReservation';

const { createReservations, confirmSale, cancelSale } = useStockReservation();

// 1. Criar reservas
const reservationIds = await createReservations({
  items: [
    { productId: 1, quantity: 5 },
    { productId: 2, quantity: 3 }
  ],
  storeId: 1,
  orderId: 123
});

// 2. Confirmar venda
await confirmSale({
  orderId: 123,
  reservationIds
});

// 3. Cancelar venda (se necessário)
await cancelSale({
  orderId: 123,
  reason: 'Cliente solicitou cancelamento'
});
```

**Recursos**:
- ✅ Criação de reservas em lote
- ✅ Rollback automático em caso de erro
- ✅ Confirmação de venda com baixa automática
- ✅ Cancelamento com devolução ao estoque
- ✅ Toast notifications integradas

---

### **2. Componentes**

#### `client/src/components/StockBadge.tsx`
Badge visual para mostrar disponibilidade de estoque.

**Uso básico**:
```tsx
import { StockBadge } from '@/components/StockBadge';

<StockBadge
  productId={1}
  storeId={1}
  quantity={1}
  showQuantity={true}
  size="md"
/>
```

**Variantes visuais**:
- 🟢 **Verde**: Estoque OK (≥10 unidades)
- 🟡 **Amarelo**: Estoque baixo (<10 unidades)
- 🔴 **Vermelho**: Sem estoque
- ⚪ **Cinza**: Carregando

**Props**:
- `productId`: ID do produto
- `storeId`: ID da loja
- `quantity`: Quantidade desejada (padrão: 1)
- `showQuantity`: Mostrar número de unidades (padrão: true)
- `size`: Tamanho do badge ('sm' | 'md' | 'lg')

**Variante compacta**:
```tsx
import { StockIndicator } from '@/components/StockBadge';

<StockIndicator productId={1} storeId={1} quantity={1} />
// Renderiza apenas um círculo colorido
```

---

#### `client/src/components/ProductCardWithStock.tsx`
Exemplo completo de ProductCard integrado com verificação de estoque.

**Recursos**:
- ✅ Badge de estoque no canto superior direito
- ✅ Badge de estoque com quantidade abaixo do preço
- ✅ Botão desabilitado quando sem estoque
- ✅ Validação antes de adicionar ao carrinho
- ✅ Toast notifications

**Como adaptar para seu ProductCard**:
1. Adicione o hook `useStockAvailability`
2. Adicione o componente `<StockBadge>` onde desejar
3. Desabilite o botão quando `!isAvailable`
4. Valide antes de adicionar ao carrinho

---

#### `client/src/components/CheckoutWithStock.tsx`
Exemplo completo de Checkout integrado com reservas e confirmação de venda.

**Fluxo automático**:
1. ✅ **Validando**: Verifica disponibilidade de todos os itens
2. ✅ **Reservando**: Cria reservas automaticamente
3. ✅ **Pronto**: Mostra resumo e aguarda pagamento
4. ✅ **Pagando**: Confirma venda e baixa estoque
5. ✅ **Sucesso**: Redireciona para página de sucesso

**Recursos**:
- ✅ Validação automática de estoque
- ✅ Criação automática de reservas
- ✅ Alerta de tempo (15 minutos)
- ✅ Tratamento de erros
- ✅ Loading states
- ✅ Cancelamento com devolução

---

## 🔄 Fluxo Completo de Integração

### **1. Página de Produtos**

```tsx
// client/src/pages/Products.tsx

import { ProductCardWithStock } from '@/components/ProductCardWithStock';

export function ProductsPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const storeId = 1; // ID da loja atual

  const handleAddToCart = (product: Product, quantity: number) => {
    setCart(prev => [...prev, { ...product, quantity }]);
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Produtos</h1>
      
      <ProductGridWithStock
        products={products}
        storeId={storeId}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
```

---

### **2. Página de Carrinho**

```tsx
// client/src/pages/Cart.tsx

import { useMultipleStockAvailability } from '@/hooks/useStockAvailability';
import { Button } from '@/components/ui/button';

export function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const storeId = 1;

  // Verificar disponibilidade de todos os itens
  const { allAvailable, unavailableItems, isLoading } = useMultipleStockAvailability(
    cart.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    })),
    storeId
  );

  const handleCheckout = () => {
    if (!allAvailable) {
      toast.error('Alguns produtos não têm estoque suficiente');
      return;
    }

    // Prosseguir para checkout
    router.push('/checkout');
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Carrinho</h1>

      {/* Lista de itens */}
      {cart.map(item => (
        <CartItem key={item.productId} item={item} storeId={storeId} />
      ))}

      {/* Alertas de estoque */}
      {unavailableItems.length > 0 && (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Alguns produtos não têm estoque suficiente:
            <ul className="mt-2 list-disc list-inside">
              {unavailableItems.map(item => (
                <li key={item.productId}>
                  Produto #{item.productId}: Disponível {item.available} de {item.quantity}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Botão de checkout */}
      <Button
        onClick={handleCheckout}
        disabled={!allAvailable || isLoading || cart.length === 0}
        className="w-full mt-6"
      >
        {isLoading ? 'Verificando estoque...' : 'Finalizar Pedido'}
      </Button>
    </div>
  );
}
```

---

### **3. Página de Checkout**

```tsx
// client/src/pages/Checkout.tsx

import { CheckoutWithStock } from '@/components/CheckoutWithStock';

export function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderId, setOrderId] = useState<number | undefined>();
  const storeId = 1;

  const handlePaymentSuccess = async (reservationIds: number[]) => {
    // Limpar carrinho
    setCart([]);
    
    // Redirecionar para página de sucesso
    router.push(`/order-success/${orderId}`);
  };

  const handleCancel = () => {
    router.push('/cart');
  };

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Finalizar Pedido</h1>

      <CheckoutWithStock
        cartItems={cart}
        storeId={storeId}
        orderId={orderId}
        onPaymentSuccess={handlePaymentSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}
```

---

## 🎯 Casos de Uso Comuns

### **Caso 1: Mostrar estoque em lista de produtos**

```tsx
<div className="product-card">
  <img src={product.image} alt={product.name} />
  <h3>{product.name}</h3>
  <p>R$ {(product.price / 100).toFixed(2)}</p>
  
  {/* Badge de estoque */}
  <StockBadge
    productId={product.id}
    storeId={1}
    quantity={1}
    showQuantity={true}
    size="sm"
  />
  
  <Button onClick={() => addToCart(product)}>
    Adicionar ao Carrinho
  </Button>
</div>
```

---

### **Caso 2: Validar antes de adicionar ao carrinho**

```tsx
const handleAddToCart = async (product: Product, quantity: number) => {
  // Verificar disponibilidade
  const { isAvailable, available } = await trpc.sales.checkAvailability.query({
    productId: product.id,
    storeId: 1,
    quantity
  });

  if (!isAvailable) {
    toast.error(`Apenas ${available} unidades disponíveis!`);
    return;
  }

  // Adicionar ao carrinho
  setCart(prev => [...prev, { product, quantity }]);
  toast.success('Produto adicionado ao carrinho!');
};
```

---

### **Caso 3: Criar reservas ao finalizar pedido**

```tsx
const handleFinalizarPedido = async () => {
  const { createReservations } = useStockReservation();

  try {
    // Criar reservas
    const reservationIds = await createReservations({
      items: cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      })),
      storeId: 1
    });

    // Salvar IDs das reservas
    setReservationIds(reservationIds);

    // Prosseguir para pagamento
    router.push('/payment');

  } catch (error) {
    toast.error('Erro ao reservar produtos');
  }
};
```

---

### **Caso 4: Confirmar venda ao pagar**

```tsx
const handlePaymentSuccess = async () => {
  const { confirmSale } = useStockReservation();

  try {
    // Confirmar venda e baixar estoque
    await confirmSale({
      orderId: 123,
      reservationIds: [1, 2, 3]
    });

    // Redirecionar para sucesso
    router.push('/order-success');

  } catch (error) {
    toast.error('Erro ao confirmar pagamento');
  }
};
```

---

### **Caso 5: Cancelar pedido**

```tsx
const handleCancelOrder = async (orderId: number) => {
  const { cancelSale } = useStockReservation();

  try {
    // Cancelar venda e devolver ao estoque
    await cancelSale({
      orderId,
      reason: 'Cliente solicitou cancelamento'
    });

    toast.success('Pedido cancelado. Estoque devolvido.');

  } catch (error) {
    toast.error('Erro ao cancelar pedido');
  }
};
```

---

## 🎨 Customização de Estilos

### **Cores do StockBadge**

Você pode customizar as cores editando o componente `StockBadge.tsx`:

```tsx
// Sem estoque
<div className="bg-red-100 text-red-700"> {/* Vermelho */}

// Estoque baixo
<div className="bg-yellow-100 text-yellow-700"> {/* Amarelo */}

// Estoque OK
<div className="bg-green-100 text-green-700"> {/* Verde */}

// Loading
<div className="bg-gray-100 text-gray-600"> {/* Cinza */}
```

---

### **Tamanhos do StockBadge**

```tsx
const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',   // Pequeno
  md: 'text-sm px-3 py-1',     // Médio (padrão)
  lg: 'text-base px-4 py-1.5'  // Grande
};
```

---

## ⚡ Performance

### **Otimizações Implementadas**:

1. ✅ **Cache inteligente** (10 segundos de staleTime)
2. ✅ **Refetch automático** (30 segundos)
3. ✅ **Refetch ao focar** (atualiza ao voltar para a aba)
4. ✅ **Queries desabilitadas** quando não necessário
5. ✅ **Batch de reservas** (cria todas de uma vez)

### **Recomendações**:

- Use `enabled: false` quando o componente não estiver visível
- Desabilite refetch automático em páginas de checkout (já tem reserva)
- Use `useMultipleStockAvailability` para validar carrinho completo

---

## 🔧 Troubleshooting

### **Problema: Badge não atualiza em tempo real**

**Causa**: `refetchInterval` desabilitado

**Solução**:
```tsx
const { data } = trpc.sales.checkAvailability.useQuery(
  { productId, storeId, quantity },
  { refetchInterval: 30000 } // 30 segundos
);
```

---

### **Problema: Reserva não foi criada**

**Causa**: Estoque insuficiente ou erro de validação

**Solução**:
```tsx
try {
  const reservationIds = await createReservations({ items, storeId });
} catch (error) {
  console.error('Erro ao criar reserva:', error);
  toast.error(error.message);
}
```

---

### **Problema: Venda não foi confirmada**

**Causa**: Reserva expirou (>15 minutos)

**Solução**:
- Verificar se `expiresAt` não passou
- Criar nova reserva se necessário
- Mostrar timer para o usuário

---

## ✅ Checklist de Integração

- [ ] Instalar dependências (`lucide-react`, `sonner`)
- [ ] Copiar hooks para `client/src/hooks/`
- [ ] Copiar componentes para `client/src/components/`
- [ ] Adicionar `StockBadge` nos ProductCards
- [ ] Adicionar validação no botão "Adicionar ao Carrinho"
- [ ] Adicionar validação no botão "Finalizar Pedido"
- [ ] Criar reservas ao iniciar checkout
- [ ] Confirmar venda ao pagar
- [ ] Testar fluxo completo no navegador
- [ ] Configurar cron job de limpeza de reservas

---

## 📝 Próximos Passos

1. **Testar no navegador** com dados reais
2. **Ajustar estilos** conforme design do projeto
3. **Adicionar analytics** (rastrear conversões)
4. **Implementar timer** de 15 minutos no checkout
5. **Adicionar notificações** de estoque baixo

---

**Status**: ✅ Frontend 100% pronto para integração!
