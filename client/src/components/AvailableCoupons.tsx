import { useState } from 'react';
import { coupons } from '@/data/coupons';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tag, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

export default function AvailableCoupons() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const activeCoupons = coupons.filter((c) => c.active);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Cupom copiado!', {
      description: `Código ${code} copiado para a área de transferência`,
    });
    
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  return (
    <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 border border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold">Cupons Disponíveis</h3>
          <Badge variant="secondary">{activeCoupons.length}</Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              Ocultar <ChevronUp className="ml-1 h-4 w-4" />
            </>
          ) : (
            <>
              Ver Todos <ChevronDown className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      <div className={`grid gap-3 ${isExpanded ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
        {(isExpanded ? activeCoupons : activeCoupons.slice(0, 2)).map((coupon) => (
          <Card key={coupon.code} className="p-4 bg-white hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <code className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                    {coupon.code}
                  </code>
                  {coupon.type === 'percentage' ? (
                    <Badge variant="secondary" className="text-xs">
                      {coupon.value}% OFF
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      R$ {coupon.value} OFF
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {coupon.description}
                </p>
                {coupon.minPurchase && (
                  <p className="text-xs text-muted-foreground">
                    Compra mínima: R$ {coupon.minPurchase.toFixed(2)}
                  </p>
                )}
                {coupon.maxDiscount && (
                  <p className="text-xs text-muted-foreground">
                    Desconto máximo: R$ {coupon.maxDiscount.toFixed(2)}
                  </p>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(coupon.code)}
                className="flex-shrink-0"
              >
                {copiedCode === coupon.code ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {!isExpanded && activeCoupons.length > 2 && (
        <p className="text-xs text-center text-muted-foreground mt-3">
          +{activeCoupons.length - 2} cupons disponíveis
        </p>
      )}
    </div>
  );
}
