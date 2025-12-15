import { useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2, Phone, Mail, Package } from 'lucide-react';

export default function OrderConfirmation() {
  const [, params] = useRoute('/order-confirmation/:orderId');
  const [, setLocation] = useLocation();
  const orderId = params?.orderId ? parseInt(params.orderId) : 0;

  const { data: order, isLoading, error } = trpc.orders.getById.useQuery(
    { orderId },
    { enabled: orderId > 0 }
  );

  useEffect(() => {
    if (!orderId) {
      setLocation('/');
    }
  }, [orderId, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Pedido não encontrado</CardTitle>
            <CardDescription>Não foi possível carregar os detalhes do pedido.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation('/')} className="w-full">
              Voltar para a loja
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Pendente', variant: 'secondary' as const },
      processing: { label: 'Processando', variant: 'default' as const },
      approved: { label: 'Aprovado', variant: 'default' as const },
      failed: { label: 'Falhou', variant: 'destructive' as const },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const },
    };
    const config = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentMethodLabel = (method: string) => {
    const methodMap = {
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      pix: 'PIX',
      food_voucher: 'Vale Alimentação',
    };
    return methodMap[method as keyof typeof methodMap] || method;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-3xl">
        {/* Cabeçalho de sucesso */}
        <div className="text-center mb-8">
          <CheckCircle2 className="h-20 w-20 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Pedido Confirmado!</h1>
          <p className="text-gray-600">
            Obrigado pela sua compra. Seu pedido foi recebido e está sendo processado.
          </p>
        </div>

        {/* Detalhes do pedido */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Pedido #{order.id}</CardTitle>
                <CardDescription>
                  Realizado em {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </CardDescription>
              </div>
              {getStatusBadge(order.paymentStatus)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dados do cliente */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Dados do Cliente
              </h3>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <span className="font-medium">Nome:</span>
                  {order.customerName}
                </p>
                {order.customerEmail && (
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {order.customerEmail}
                  </p>
                )}
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {order.customerPhone}
                </p>
              </div>
            </div>

            <Separator />

            {/* Itens do pedido */}
            <div>
              <h3 className="font-semibold mb-3">Itens do Pedido</h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">{item.productName}</p>
                      {item.productBrand && (
                        <p className="text-sm text-gray-600">{item.productBrand}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        Quantidade: {item.quantity} x R$ {(item.unitPrice / 100).toFixed(2)}
                      </p>
                    </div>
                    <p className="font-medium">
                      R$ {(item.totalPrice / 100).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Resumo financeiro */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>R$ {(order.totalAmount / 100).toFixed(2)}</span>
              </div>
              
              {(order.discountAmount ?? 0) > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Desconto {order.couponCode && `(${order.couponCode})`}</span>
                  <span>-R$ {((order.discountAmount ?? 0) / 100).toFixed(2)}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">R$ {(order.finalAmount / 100).toFixed(2)}</span>
              </div>
            </div>

            <Separator />

            {/* Informações de pagamento */}
            <div>
              <h3 className="font-semibold mb-2">Pagamento</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-600">Método:</span>{' '}
                  {order.paymentMethod ? getPaymentMethodLabel(order.paymentMethod) : 'Não informado'}
                </p>
                {order.transactionId && (
                  <p>
                    <span className="text-gray-600">ID da Transação:</span>{' '}
                    {order.transactionId}
                  </p>
                )}
              </div>
            </div>

            {order.notes && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Observações</h3>
                  <p className="text-sm text-gray-600">{order.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex gap-4">
          <Button onClick={() => setLocation('/')} variant="outline" className="flex-1">
            Continuar Comprando
          </Button>
          <Button
            onClick={() => {
              const whatsappUrl = `https://wa.me/551231973400?text=${encodeURIComponent(
                `Olá! Gostaria de saber mais sobre o pedido #${order.id}`
              )}`;
              if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                window.location.href = whatsappUrl;
              } else {
                window.open(whatsappUrl, '_blank');
              }
            }}
            className="flex-1"
          >
            <Phone className="mr-2 h-4 w-4" />
            Falar no WhatsApp
          </Button>
        </div>

        {/* Informações adicionais */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-900">
              <strong>Importante:</strong> Em breve entraremos em contato para confirmar a 
              disponibilidade dos produtos e combinar a retirada. A loja funciona aos 
              <strong> sábados e domingos das 7h às 13h</strong>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
