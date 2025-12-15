import { ProductInfo } from '@/data/products';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, AlertTriangle, Package } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { getStockStatus, isLowStock } from '@/lib/stock';

interface ProductGridViewProps {
  products: ProductInfo[];
  onProductClick: (product: ProductInfo) => void;
}

export default function ProductGridView({
  products,
  onProductClick,
}: ProductGridViewProps) {
  const { addItem } = useCart();

  const handleAddToCart = (product: ProductInfo, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar abrir o modal ao clicar no botão
    addItem(product, 1);
    toast.success('Produto adicionado!', {
      description: `${product.name} adicionado ao carrinho.`,
    });
  };

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Package className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Nenhum produto encontrado</h3>
        <p className="text-muted-foreground">
          Tente ajustar os filtros ou fazer uma nova busca
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => {
        const stockStatus = getStockStatus(product.stock);
        
        return (
          <Card
            key={product.id}
            className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => onProductClick(product)}
          >
            {/* Imagem/Cor do produto */}
            <div className="relative h-48 bg-white flex items-center justify-center overflow-hidden">
              {product.image ? (
                <>
                  {/* Skeleton loader */}
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
                  <img
                    src={product.image}
                    alt={product.name}
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
                      fallback.className = 'absolute inset-0 flex items-center justify-center';
                      fallback.style.backgroundColor = product.color;
                      fallback.innerHTML = `<div class="text-white text-6xl font-bold opacity-20">${product.name.charAt(0)}</div>`;
                      target.parentElement?.appendChild(fallback);
                    }}
                  />
                </>
              ) : (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ backgroundColor: product.color }}
                >
                  <div className="text-white text-6xl font-bold opacity-20">
                    {product.name.charAt(0)}
                  </div>
                </div>
              )}
              
              {/* Badge de estoque baixo */}
              {isLowStock(product.stock) && (
                <div className="absolute top-2 right-2">
                  <Badge
                    className={
                      stockStatus.status === 'critical'
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-orange-500 hover:bg-orange-600'
                    }
                  >
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {stockStatus.label}
                  </Badge>
                </div>
              )}
              
              {/* Badge de desconto */}
              {product.discount && product.discount > 0 && (
                <div className="absolute top-2 left-2">
                  <Badge className="bg-green-500 hover:bg-green-600">
                    {product.discount}% OFF
                  </Badge>
                </div>
              )}
            </div>

            {/* Informações do produto */}
            <div className="p-4 space-y-3">
              {/* Nome e marca */}
              <div>
                <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-muted-foreground">{product.brand}</p>
              </div>

              {/* Peso */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="h-4 w-4" />
                <span>{product.weight}</span>
              </div>

              {/* Quantidade */}
              <div className="text-sm font-semibold text-gray-700">
                {product.unit || '10 un.'}
              </div>

              {/* Preço */}
              <div className="flex items-baseline gap-2">
                {product.tablePrice && product.tablePrice > product.price && (
                  <span className="text-sm text-muted-foreground line-through">
                    R$ {product.tablePrice.toFixed(2)}
                  </span>
                )}
                <span className="text-2xl font-bold text-primary">
                  R$ {product.price.toFixed(2)}
                </span>
              </div>

              {/* Estoque */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Estoque:</span>
                <Badge
                  variant={stockStatus.status === 'high' ? 'default' : 'secondary'}
                  className={
                    stockStatus.status === 'high'
                      ? 'bg-green-500 hover:bg-green-600'
                      : stockStatus.status === 'critical'
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }
                >
                  {product.stock} unidades
                </Badge>
              </div>

              {/* Botão adicionar ao carrinho - Destacado */}
              <Button
                onClick={(e) => handleAddToCart(product, e)}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-bold"
                size="lg"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Adicionar ao Carrinho
              </Button>

              {/* Link para ver detalhes */}
              <p className="text-xs text-center text-muted-foreground mt-1">
                Clique no card para ver mais detalhes
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
