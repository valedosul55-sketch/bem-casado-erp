/**
 * Hook para verificar disponibilidade de estoque em tempo real
 * 
 * Usa o endpoint sales.checkAvailability para calcular:
 * Estoque Disponível = Estoque Físico - Reservas Ativas
 */

import { trpc } from '@/lib/trpc';

export interface StockAvailabilityParams {
  productId: number;
  storeId: number;
  quantity: number;
  enabled?: boolean; // Controla se a query deve ser executada
}

export interface StockAvailabilityResult {
  available: number;
  isAvailable: boolean;
  requested: number;
  isLoading: boolean;
  error: string | null;
}

export function useStockAvailability({
  productId,
  storeId,
  quantity,
  enabled = true
}: StockAvailabilityParams): StockAvailabilityResult {
  
  const { data, isLoading, error } = trpc.sales.checkAvailability.useQuery(
    {
      productId,
      storeId,
      quantity
    },
    {
      enabled: enabled && productId > 0 && storeId > 0 && quantity > 0,
      refetchInterval: 30000, // Atualiza a cada 30 segundos
      refetchOnWindowFocus: true, // Atualiza ao focar na janela
      staleTime: 10000, // Considera dados frescos por 10 segundos
    }
  );

  return {
    available: data?.available ?? 0,
    isAvailable: data?.isAvailable ?? false,
    requested: data?.requested ?? quantity,
    isLoading,
    error: error?.message ?? null
  };
}

/**
 * Hook para verificar disponibilidade de múltiplos produtos
 * Útil para validar carrinho completo
 */
export function useMultipleStockAvailability(
  items: Array<{ productId: number; quantity: number }>,
  storeId: number,
  enabled: boolean = true
) {
  const results = items.map(item =>
    trpc.sales.checkAvailability.useQuery(
      {
        productId: item.productId,
        storeId,
        quantity: item.quantity
      },
      {
        enabled: enabled && item.productId > 0 && storeId > 0,
        refetchInterval: 30000,
        staleTime: 10000,
      }
    )
  );

  const isLoading = results.some(r => r.isLoading);
  const hasError = results.some(r => r.error);
  const allAvailable = results.every(r => r.data?.isAvailable);

  const unavailableItems = results
    .map((r, index) => ({
      ...items[index],
      available: r.data?.available ?? 0,
      isAvailable: r.data?.isAvailable ?? false
    }))
    .filter(item => !item.isAvailable);

  return {
    isLoading,
    hasError,
    allAvailable,
    unavailableItems,
    results: results.map(r => r.data)
  };
}
