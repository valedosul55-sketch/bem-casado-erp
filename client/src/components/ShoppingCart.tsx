import { useState } from 'react';
import { useLocation } from 'wouter';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ShoppingCart as CartIcon, Trash2, Plus, Minus, Send, X, Tag, Check, AlertCircle, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { validateCoupon } from '@/data/coupons';
import { VisaIcon, MastercardIcon, EloIcon, AmexIcon, HipercardIcon, PixIcon, AleloIcon, SodexoIcon, TicketIcon, VRIcon, IFoodIcon } from "@/components/PaymentIcons";

export default function ShoppingCart() {
  const [, setLocation] = useLocation();
  const { items, coupon, removeItem, updateQuantity, clearCart, applyCoupon, removeCoupon, getTotalItems, getTotalPrice, getSubtotal, getDiscount } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');

  const handleSendWhatsApp = () => {
    if (items.length === 0) {
      toast.error('Carrinho vazio', {
        description: 'Adicione produtos ao carrinho antes de enviar o pedido.',
      });
      return;
    }

    // Formatar mensagem para WhatsApp
    let message = '*🛒 PEDIDO - LOJA DE FÁBRICA BEM CASADO*\n\n';
    
    items.forEach((item, index) => {
      message += `*${index + 1}. ${item.product.name}*\n`;
      message += `   Marca: ${item.product.brand}\n`;
      message += `   Peso: ${item.product.weight}\n`;
      message += `   Quantidade: ${item.quantity} ${item.product.priceUnit}${item.quantity > 1 ? 's' : ''}\n`;
      message += `   Preço unitário: R$ ${item.product.price.toFixed(2)}\n`;
      message += `   Subtotal: R$ ${(item.product.price * item.quantity).toFixed(2)}\n\n`;
    });

    message += `*━━━━━━━━━━━━━━━━━━━*\n`;
    message += `*Subtotal: R$ ${getSubtotal().toFixed(2)}*\n`;
    
    if (coupon) {
      message += `*Cupom (${coupon.code}): -R$ ${getDiscount().toFixed(2)}*\n`;
    }
    
    message += `*TOTAL: R$ ${getTotalPrice().toFixed(2)}*\n`;
    message += `*Total de itens: ${getTotalItems()}*\n\n`;
    message += `_Aguardo confirmação de disponibilidade e forma de pagamento._`;

    // Número do WhatsApp da Bem Casado
    const phoneNumber = '551231973400'; // (12) 3197-3400
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    // Abrir WhatsApp (otimizado para celular)
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      window.location.href = whatsappUrl;
    } else {
      window.open(whatsappUrl, '_blank');
    }
    
    toast.success('Pedido enviado!', {
      description: 'Você será redirecionado para o WhatsApp.',
    });
  };

  const handleClearCart = () => {
    clearCart();
    removeCoupon();
    setCouponCode('');
    setCouponError('');
    toast.success('Carrinho limpo', {
      description: 'Todos os itens foram removidos.',
    });
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponError('Digite um código de cupom');
      return;
    }

    const validation = validateCoupon(couponCode, getSubtotal());
    
    if (validation.valid && validation.coupon) {
      applyCoupon(validation.coupon);
      setCouponError('');
      toast.success('Cupom aplicado!', {
        description: validation.message,
      });
    } else {
      setCouponError(validation.message);
      toast.error('Cupom inválido', {
        description: validation.message,
      });
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponCode('');
    setCouponError('');
    toast.info('Cupom removido');
  };

  return (
    <>
      {/* Botão flutuante do carrinho */}
      <Button
        variant="default"
        size="lg"
        className="fixed bottom-6 right-6 rounded-full w-16 h-16 shadow-lg z-50"
        onClick={() => setIsOpen(true)}
      >
        <CartIcon className="h-6 w-6" />
        {getTotalItems() > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 rounded-full"
          >
            {getTotalItems()}
          </Badge>
        )}
      </Button>

      {/* Overlay e painel lateral */}
      {isOpen && (
        <>
          {/* Overlay escuro */}
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsOpen(false)}
          />

          {/* Painel lateral */}
          <div className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-background shadow-xl z-50 flex flex-col">
            {/* Header */}
            <div className="border-b p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <CartIcon className="h-6 w-6" />
                  Carrinho de Compras
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {items.length === 0
                  ? 'Seu carrinho está vazio'
                  : `${getTotalItems()} ${getTotalItems() === 1 ? 'item' : 'itens'} no carrinho`}
              </p>
            </div>

            {/* Conteúdo */}
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <CartIcon className="h-24 w-24 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold">Carrinho vazio</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Clique nos produtos da loja para adicionar ao carrinho
                </p>
              </div>
            ) : (
              <>
                {/* Lista de itens */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex gap-4 p-4 bg-muted rounded-lg"
                    >
                      <div className="w-16 h-16 rounded flex-shrink-0 border-2 border-gray-300 bg-white flex items-center justify-center overflow-hidden relative">
                        {item.product.image ? (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-full h-full object-contain relative z-10"
                              loading="eager"
                              onLoad={(e) => {
                                const skeleton = (e.target as HTMLImageElement).previousElementSibling;
                                if (skeleton) skeleton.remove();
                              }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = document.createElement('div');
                                fallback.style.width = '100%';
                                fallback.style.height = '100%';
                                fallback.style.backgroundColor = item.product.color;
                                fallback.className = 'relative z-10';
                                target.parentElement?.appendChild(fallback);
                              }}
                            />
                          </>
                        ) : (
                          <div
                            className="w-full h-full relative z-10"
                            style={{ backgroundColor: item.product.color }}
                          />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {item.product.brand} - {item.product.weight}
                        </p>
                        <p className="text-sm font-bold text-primary mt-1">
                          R$ {item.product.price.toFixed(2)} / {item.product.priceUnit}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          
                          <span className="text-sm font-semibold w-8 text-center">
                            {item.quantity}
                          </span>
                          
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 ml-auto text-destructive"
                            onClick={() => removeItem(item.product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm font-bold">
                          R$ {(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer com total e ações */}
                <div className="border-t p-6 space-y-4">
                  {/* Campo de cupom */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Cupom de Desconto
                    </label>
                    
                    {coupon ? (
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <Check className="h-4 w-4 text-green-600" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-green-800">{coupon.code}</p>
                          <p className="text-xs text-green-600">{coupon.description}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveCoupon}
                          className="text-green-700 hover:text-green-900"
                        >
                          Remover
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Digite o código"
                            value={couponCode}
                            onChange={(e) => {
                              setCouponCode(e.target.value.toUpperCase());
                              setCouponError('');
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleApplyCoupon();
                              }
                            }}
                            className="flex-1"
                          />
                          <Button
                            onClick={handleApplyCoupon}
                            variant="outline"
                          >
                            Aplicar
                          </Button>
                        </div>
                        {couponError && (
                          <div className="flex items-start gap-2 text-xs text-destructive">
                            <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span>{couponError}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Formas de Pagamento Aceitas */}
                  <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Formas de Pagamento Aceitas
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1.5">Cartão de Crédito/Débito</p>
                        <div className="flex flex-wrap gap-2">
                          <VisaIcon className="h-8" />
                          <MastercardIcon className="h-8" />
                          <EloIcon className="h-8" />
                          <HipercardIcon className="h-8" />
                          <AmexIcon className="h-8" />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1.5">Vales Alimentação/Refeição</p>
                        <div className="flex flex-wrap gap-2">
                          <AleloIcon className="h-8" />
                          <SodexoIcon className="h-8" />
                          <TicketIcon className="h-8" />
                          <VRIcon className="h-8" />
                          <IFoodIcon className="h-8" />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1.5">Pix</p>
                        <div className="flex flex-wrap gap-2">
                          <PixIcon className="h-9" />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center pt-1">Pagamentos processados com segurança pelo SafraPay</p>
                  </div>

                  {/* Resumo de valores */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>R$ {getSubtotal().toFixed(2)}</span>
                    </div>
                    
                    {coupon && getDiscount() > 0 && (
                      <div className="flex justify-between text-sm text-green-600 font-semibold">
                        <span>Desconto ({coupon.code}):</span>
                        <span>-R$ {getDiscount().toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span className="text-primary text-2xl">R$ {getTotalPrice().toFixed(2)}</span>
                    </div>
                    
                    {coupon && getDiscount() > 0 && (
                      <p className="text-xs text-green-600 text-center">
                        Você está economizando R$ {getDiscount().toFixed(2)}!
                      </p>
                    )}
                  </div>
                  
                  <Button
                    onClick={() => {
                      setIsOpen(false);
                      setLocation('/checkout');
                    }}
                    className="w-full"
                    size="lg"
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                    Finalizar Compra
                  </Button>
                  
                  <Button
                    onClick={handleSendWhatsApp}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <Send className="mr-2 h-5 w-5" />
                    Enviar via WhatsApp
                  </Button>
                  
                  <Button
                    onClick={handleClearCart}
                    variant="outline"
                    className="w-full"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Limpar Carrinho
                  </Button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
