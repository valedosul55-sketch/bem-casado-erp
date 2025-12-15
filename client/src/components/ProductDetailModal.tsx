import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProductInfo } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import { getStockStatus, getSimilarProducts, isLowStock } from '@/lib/stock';
import { Package, Calendar, Hash, Warehouse, ShoppingCart, Plus, Minus, AlertTriangle, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface ProductDetailModalProps {
  product: ProductInfo | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
}: ProductDetailModalProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  // Resetar quantidade quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
    }
  }, [isOpen]);

  if (!product) return null;

  const stockStatus = getStockStatus(product.stock);
  const similarProducts = isLowStock(product.stock) ? getSimilarProducts(product, 3) : [];

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success('Produto adicionado!', {
      description: `${quantity} ${product.priceUnit}${quantity > 1 ? 's' : ''} de ${product.name} adicionado ao carrinho.`,
    });
    setQuantity(1);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold">
                {product.name}
              </DialogTitle>
              <DialogDescription className="text-base mt-1">
                {product.brand}
              </DialogDescription>
            </div>
            <div
              className="w-16 h-16 rounded-lg border-2 border-gray-300 flex-shrink-0"
              style={{ backgroundColor: product.color }}
            />
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Preço em destaque */}
          <div className="bg-primary/10 rounded-lg p-6 text-center">
            <div className="text-sm text-muted-foreground mb-1">Preço de Fábrica</div>
            
            {product.tablePrice && product.discount ? (
              <>
                <div className="text-lg text-muted-foreground line-through mb-1">
                  R$ {product.tablePrice.toFixed(2)}
                </div>
                <div className="text-4xl font-bold text-primary">
                  R$ {product.price.toFixed(2)}
                </div>
                <Badge className="mt-2 bg-green-500 hover:bg-green-600">
                  {product.discount}% de desconto
                </Badge>
              </>
            ) : (
              <div className="text-4xl font-bold text-primary">
                R$ {product.price.toFixed(2)}
              </div>
            )}
            
            <div className="text-sm text-muted-foreground mt-2">
              por {product.priceUnit}
            </div>
          </div>

          {/* Descrição */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Descrição</h3>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          {/* Informações técnicas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
              <Package className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <div className="font-semibold text-sm">Peso</div>
                <div className="text-muted-foreground">{product.weight}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <div className="font-semibold text-sm">Validade</div>
                <div className="text-muted-foreground">{product.validity}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
              <Hash className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <div className="font-semibold text-sm">Lote</div>
                <div className="text-muted-foreground font-mono text-sm">
                  {product.lot}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
              <Warehouse className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <div className="font-semibold text-sm">Estoque</div>
                <div className="text-muted-foreground">
                  {product.stock} unidades
                </div>
              </div>
            </div>
          </div>

          {/* Status do estoque com alerta */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <span className="font-semibold">Status do Estoque:</span>
              <Badge
                variant={stockStatus.status === 'high' ? 'default' : 'outline'}
                className={
                  stockStatus.status === 'high'
                    ? 'bg-green-500 hover:bg-green-600'
                    : stockStatus.status === 'critical'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }
              >
                {stockStatus.label}
              </Badge>
            </div>
            
            {isLowStock(product.stock) && (
              <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-orange-800">
                  <p className="font-semibold mb-1">Atenção: Estoque Limitado!</p>
                  <p>Este produto possui apenas {product.stock} unidades disponíveis. Garanta o seu agora ou confira as alternativas abaixo.</p>
                </div>
              </div>
            )}
          </div>

          {/* Seleção de quantidade */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-lg mb-3">Adicionar ao Carrinho</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-bold"
                size="lg"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Adicionar - R$ {(product.price * quantity).toFixed(2)}
              </Button>
            </div>
          </div>

          {/* Produtos alternativos */}
          {similarProducts.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Produtos Alternativos Disponíveis
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                Produtos similares com estoque garantido:
              </p>
              <div className="grid grid-cols-1 gap-2">
                {similarProducts.map((alt) => (
                  <div
                    key={alt.id}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div
                      className="w-12 h-12 rounded border-2 border-gray-300 flex-shrink-0"
                      style={{ backgroundColor: alt.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{alt.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {alt.brand} - {alt.weight}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm font-bold text-primary">
                          R$ {alt.price.toFixed(2)}
                        </p>
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          {alt.stock} unidades
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Informações adicionais */}
          <div className="text-xs text-muted-foreground border-t pt-4">
            <p>
              <strong>Nota:</strong> Preços válidos para compras na loja de fábrica.
              Consulte condições especiais para grandes volumes.
            </p>
            <p className="mt-2">
              <strong>Contato:</strong> comercial@arrozbemcasado.com.br | WhatsApp:
              (12) 93197-3400
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
