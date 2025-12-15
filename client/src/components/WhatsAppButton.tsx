import { useState, useEffect } from 'react';
import { MessageCircle, Clock } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Badge } from '@/components/ui/badge';

const WHATSAPP_NUMBER = '551231973400'; // (12) 3197-3400

function isBusinessHours(): boolean {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  const hour = now.getHours();

  // Sábado e Domingo: 7h às 13h
  if (day === 6 || day === 0) {
    return hour >= 7 && hour < 13;
  }

  // Fechado durante a semana
  return false;
}

export default function WhatsAppButton() {
  const { items, coupon } = useCart();
  const [isOnline, setIsOnline] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Verificar horário inicial
    setIsOnline(isBusinessHours());

    // Atualizar a cada minuto
    const interval = setInterval(() => {
      setIsOnline(isBusinessHours());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleWhatsAppClick = () => {
    let message = 'Olá! Gostaria de fazer um pedido:\n\n';

    if (items.length > 0) {
      message += '*Produtos:*\n';
      items.forEach((item) => {
        message += `• ${item.product.name} - ${item.quantity}x R$ ${item.product.price.toFixed(2)} = R$ ${(item.quantity * item.product.price).toFixed(2)}\n`;
      });

      const subtotal = items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
      message += `\n*Subtotal:* R$ ${subtotal.toFixed(2)}\n`;

      if (coupon) {
        const discount = coupon.type === 'percentage' ? (subtotal * coupon.value) / 100 : coupon.value;
        const total = subtotal - discount;
        message += `*Cupom:* ${coupon.code} (-${coupon.type === 'percentage' ? coupon.value + '%' : 'R$ ' + coupon.value.toFixed(2)})
`;;
        message += `*Desconto:* -R$ ${discount.toFixed(2)}\n`;
        message += `*Total:* R$ ${total.toFixed(2)}\n`;
      }
    } else {
      message += 'Gostaria de saber mais sobre os produtos disponíveis.\n';
    }

    message += '\nAguardo retorno!';

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    // Para celular: tentar abrir diretamente no app
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      window.location.href = whatsappUrl;
    } else {
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-40">
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-lg shadow-xl p-4 animate-in slide-in-from-bottom-2">
          <div className="flex items-start gap-3">
            <MessageCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-sm mb-1">Fale conosco no WhatsApp!</p>
              <p className="text-xs text-muted-foreground mb-2">
                {isOnline
                  ? 'Estamos online agora. Resposta imediata!'
                  : 'Deixe sua mensagem. Respondemos em breve!'}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Sábados e Domingos: 7h às 13h</span>
              </div>
            </div>
          </div>
          {/* Seta do tooltip */}
          <div className="absolute bottom-0 left-6 transform translate-y-1/2 rotate-45 w-3 h-3 bg-white" />
        </div>
      )}

      {/* Botão flutuante */}
      <button
        onClick={handleWhatsAppClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="relative bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 group"
        aria-label="Falar no WhatsApp"
      >
        {/* Animação de pulse */}
        <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
        
        {/* Ícone */}
        <MessageCircle className="h-7 w-7 relative z-10" />

        {/* Badge de status */}
        {isOnline && (
          <Badge className="absolute -top-1 -right-1 bg-green-600 text-white text-xs px-2 py-0.5 border-2 border-white">
            Online
          </Badge>
        )}
      </button>

      {/* Texto auxiliar (mobile) */}
      <div className="md:hidden text-center mt-2">
        <span className="text-xs text-muted-foreground bg-white px-2 py-1 rounded shadow">
          Atendimento
        </span>
      </div>
    </div>
  );
}
