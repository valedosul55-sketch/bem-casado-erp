/**
 * Exemplo de Checkout integrado com sistema de baixa automática
 * 
 * Fluxo:
 * 1. Verificar disponibilidade de todos os itens
 * 2. Criar reservas ao iniciar checkout
 * 3. Confirmar venda ao pagar
 * 4. Cancelar se necessário
 */

import { useState, useEffect } from 'react';
import { useStockReservation } from '@/hooks/useStockReservation';
import { useMultipleStockAvailability } from '@/hooks/useStockAvailability';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export interface CartItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number; // Em centavos
}

export interface CheckoutWithStockProps {
  cartItems: CartItem[];
  storeId: number;
  orderId?: number;
  onPaymentSuccess: (reservationIds: number[]) => void;
  onCancel: () => void;
}

export function CheckoutWithStock({
  cartItems,
  storeId,
  orderId,
  onPaymentSuccess,
  onCancel
}: CheckoutWithStockProps) {
  
  const [reservationIds, setReservationIds] = useState<number[]>([]);
  const [checkoutStep, setCheckoutStep] = useState<'validating' | 'reserving' | 'ready' | 'paying' | 'error'>('validating');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    createReservations,
    confirmSale,
    isCreatingReservation,
    isConfirmingSale
  } = useStockReservation();

  // Verificar disponibilidade de todos os itens
  const {
    isLoading: isCheckingStock,
    allAvailable,
    unavailableItems
  } = useMultipleStockAvailability(
    cartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    })),
    storeId,
    checkoutStep === 'validating'
  );

  // Efeito para criar reservas após validação
  useEffect(() => {
    if (checkoutStep === 'validating' && !isCheckingStock) {
      if (!allAvailable) {
        setCheckoutStep('error');
        setErrorMessage('Alguns produtos não têm estoque suficiente');
        return;
      }

      // Iniciar criação de reservas
      setCheckoutStep('reserving');
      handleCreateReservations();
    }
  }, [checkoutStep, isCheckingStock, allAvailable]);

  const handleCreateReservations = async () => {
    try {
      const ids = await createReservations({
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        storeId,
        orderId
      });

      setReservationIds(ids);
      setCheckoutStep('ready');
      toast.success('Produtos reservados! Você tem 15 minutos para finalizar.');

    } catch (error) {
      setCheckoutStep('error');
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao reservar produtos');
    }
  };

  const handlePayment = async () => {
    if (!orderId) {
      toast.error('ID do pedido não encontrado');
      return;
    }

    setCheckoutStep('paying');

    try {
      const success = await confirmSale({
        orderId,
        reservationIds
      });

      if (success) {
        onPaymentSuccess(reservationIds);
      } else {
        setCheckoutStep('error');
        setErrorMessage('Erro ao confirmar pagamento');
      }

    } catch (error) {
      setCheckoutStep('error');
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao processar pagamento');
    }
  };

  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(priceInCents / 100);
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

  // Estado: Validando estoque
  if (checkoutStep === 'validating') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verificando Disponibilidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin mr-2" size={24} />
            <span>Verificando estoque dos produtos...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Estado: Criando reservas
  if (checkoutStep === 'reserving') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reservando Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin mr-2" size={24} />
            <span>Reservando produtos no estoque...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Estado: Erro
  if (checkoutStep === 'error') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Erro no Checkout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>

          {unavailableItems.length > 0 && (
            <div className="space-y-2">
              <p className="font-semibold">Produtos sem estoque:</p>
              <ul className="list-disc list-inside space-y-1">
                {unavailableItems.map((item, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    Produto #{item.productId}: Solicitado {item.quantity}, Disponível {item.available}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button onClick={onCancel} variant="outline" className="w-full">
            Voltar ao Carrinho
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Estado: Pronto para pagar
  return (
    <Card>
      <CardHeader>
        <CardTitle>Finalizar Pedido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resumo do pedido */}
        <div className="space-y-3">
          <h3 className="font-semibold">Resumo do Pedido</h3>
          {cartItems.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span>
                {item.productName} x {item.quantity}
              </span>
              <span>{formatPrice(item.unitPrice * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t pt-3 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{formatPrice(totalAmount)}</span>
          </div>
        </div>

        {/* Alerta de reserva */}
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Produtos reservados por 15 minutos. Complete o pagamento para confirmar a compra.
          </AlertDescription>
        </Alert>

        {/* Botões */}
        <div className="flex gap-3">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1"
            disabled={checkoutStep === 'paying'}
          >
            Cancelar
          </Button>
          <Button
            onClick={handlePayment}
            className="flex-1"
            disabled={checkoutStep === 'paying'}
          >
            {checkoutStep === 'paying' ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Processando...
              </>
            ) : (
              'Pagar Agora'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
