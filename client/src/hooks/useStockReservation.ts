/**
 * Hook para gerenciar reservas de estoque
 * 
 * Funcionalidades:
 * - Criar reserva ao finalizar pedido
 * - Confirmar venda ao pagar
 * - Cancelar reserva se necessário
 */

import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export interface ReservationItem {
  productId: number;
  quantity: number;
}

export interface CreateReservationParams {
  items: ReservationItem[];
  storeId: number;
  orderId?: number;
}

export interface ConfirmSaleParams {
  orderId: number;
  reservationIds: number[];
}

export interface CancelSaleParams {
  orderId: number;
  reason: string;
}

export function useStockReservation() {
  
  const createReservationMutation = trpc.sales.createReservation.useMutation();
  const confirmSaleMutation = trpc.sales.confirmSale.useMutation();
  const cancelSaleMutation = trpc.sales.cancelSale.useMutation();

  /**
   * Criar reservas para múltiplos produtos
   * Retorna array de IDs das reservas criadas
   */
  const createReservations = async ({
    items,
    storeId,
    orderId
  }: CreateReservationParams): Promise<number[]> => {
    const reservationIds: number[] = [];

    try {
      for (const item of items) {
        const result = await createReservationMutation.mutateAsync({
          productId: item.productId,
          storeId,
          quantity: item.quantity,
          orderId
        });

        if (!result.success) {
          // Se falhar, cancelar reservas já criadas
          for (const id of reservationIds) {
            try {
              await trpc.sales.cancelReservation.mutate({
                reservationId: id,
                reason: 'Erro ao criar reservas'
              });
            } catch (error) {
              console.error('[Reservation] Erro ao cancelar reserva:', error);
            }
          }

          throw new Error(result.error || 'Erro ao criar reserva');
        }

        reservationIds.push(result.reservationId!);
      }

      return reservationIds;

    } catch (error) {
      console.error('[Reservation] Erro ao criar reservas:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao reservar produtos');
      throw error;
    }
  };

  /**
   * Confirmar venda e baixar estoque automaticamente
   */
  const confirmSale = async ({
    orderId,
    reservationIds
  }: ConfirmSaleParams): Promise<boolean> => {
    try {
      const result = await confirmSaleMutation.mutateAsync({
        orderId,
        reservationIds
      });

      if (!result.success) {
        throw new Error(result.error || 'Erro ao confirmar venda');
      }

      toast.success('Venda confirmada! Estoque atualizado.');
      return true;

    } catch (error) {
      console.error('[Reservation] Erro ao confirmar venda:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao confirmar venda');
      return false;
    }
  };

  /**
   * Cancelar venda e devolver ao estoque
   */
  const cancelSale = async ({
    orderId,
    reason
  }: CancelSaleParams): Promise<boolean> => {
    try {
      const result = await cancelSaleMutation.mutateAsync({
        orderId,
        reason
      });

      if (!result.success) {
        throw new Error(result.error || 'Erro ao cancelar venda');
      }

      toast.success('Venda cancelada. Estoque devolvido.');
      return true;

    } catch (error) {
      console.error('[Reservation] Erro ao cancelar venda:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao cancelar venda');
      return false;
    }
  };

  return {
    createReservations,
    confirmSale,
    cancelSale,
    isCreatingReservation: createReservationMutation.isPending,
    isConfirmingSale: confirmSaleMutation.isPending,
    isCancellingSale: cancelSaleMutation.isPending
  };
}
