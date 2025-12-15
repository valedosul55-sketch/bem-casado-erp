/**
 * Componente para mostrar disponibilidade de estoque em tempo real
 * 
 * Exibe:
 * - Quantidade disponível
 * - Status visual (verde/amarelo/vermelho)
 * - Loading state
 */

import { useStockAvailability } from '@/hooks/useStockAvailability';
import { Loader2, Package, AlertTriangle, XCircle } from 'lucide-react';

export interface StockBadgeProps {
  productId: number;
  storeId: number;
  quantity?: number; // Quantidade que o usuário quer comprar (padrão: 1)
  showQuantity?: boolean; // Mostrar número de unidades disponíveis
  size?: 'sm' | 'md' | 'lg';
}

export function StockBadge({
  productId,
  storeId,
  quantity = 1,
  showQuantity = true,
  size = 'md'
}: StockBadgeProps) {
  
  const { available, isAvailable, isLoading, error } = useStockAvailability({
    productId,
    storeId,
    quantity
  });

  // Tamanhos
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  // Loading
  if (isLoading) {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full bg-gray-100 text-gray-600 ${sizeClasses[size]}`}>
        <Loader2 size={iconSizes[size]} className="animate-spin" />
        <span>Verificando...</span>
      </div>
    );
  }

  // Erro
  if (error) {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full bg-red-100 text-red-700 ${sizeClasses[size]}`}>
        <AlertTriangle size={iconSizes[size]} />
        <span>Erro ao verificar</span>
      </div>
    );
  }

  // Sem estoque
  if (available === 0) {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full bg-red-100 text-red-700 ${sizeClasses[size]}`}>
        <XCircle size={iconSizes[size]} />
        <span>Sem estoque</span>
      </div>
    );
  }

  // Estoque baixo (< 10 unidades)
  if (available < 10) {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full bg-yellow-100 text-yellow-700 ${sizeClasses[size]}`}>
        <AlertTriangle size={iconSizes[size]} />
        <span>
          {showQuantity ? `Apenas ${available} ${available === 1 ? 'unidade' : 'unidades'}` : 'Estoque baixo'}
        </span>
      </div>
    );
  }

  // Estoque OK
  if (!isAvailable) {
    // Tem estoque, mas não o suficiente para a quantidade solicitada
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full bg-yellow-100 text-yellow-700 ${sizeClasses[size]}`}>
        <AlertTriangle size={iconSizes[size]} />
        <span>
          {showQuantity ? `Apenas ${available} disponíveis` : 'Estoque limitado'}
        </span>
      </div>
    );
  }

  // Estoque disponível
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full bg-green-100 text-green-700 ${sizeClasses[size]}`}>
      <Package size={iconSizes[size]} />
      <span>
        {showQuantity ? `${available} disponíveis` : 'Em estoque'}
      </span>
    </div>
  );
}

/**
 * Variante compacta apenas com ícone e cor
 */
export function StockIndicator({
  productId,
  storeId,
  quantity = 1
}: Omit<StockBadgeProps, 'showQuantity' | 'size'>) {
  
  const { available, isLoading } = useStockAvailability({
    productId,
    storeId,
    quantity
  });

  if (isLoading) {
    return <div className="w-3 h-3 rounded-full bg-gray-300 animate-pulse" />;
  }

  if (available === 0) {
    return <div className="w-3 h-3 rounded-full bg-red-500" title="Sem estoque" />;
  }

  if (available < 10) {
    return <div className="w-3 h-3 rounded-full bg-yellow-500" title={`${available} unidades`} />;
  }

  return <div className="w-3 h-3 rounded-full bg-green-500" title="Em estoque" />;
}
