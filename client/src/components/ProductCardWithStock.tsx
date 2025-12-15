/**
 * Exemplo de ProductCard integrado com verificação de estoque
 * 
 * Este é um exemplo de como integrar o StockBadge em um card de produto.
 * Adapte conforme o design do seu ProductCard existente.
 */

import { StockBadge } from './StockBadge';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { ShoppingCart } from 'lucide-react';
import { useStockAvailability } from '@/hooks/useStockAvailability';
import { toast } from 'sonner';

export interface Product {
  id: number;
  name: string;
  brand?: string;
  price: number; // Em centavos
  image?: string;
  description?: string;
}

export interface ProductCardWithStockProps {
  product: Product;
  storeId: number;
  onAddToCart: (product: Product, quantity: number) => void;
}

export function ProductCardWithStock({
  product,
  storeId,
  onAddToCart
}: ProductCardWithStockProps) {
  
  // Verificar disponibilidade para 1 unidade
  const { isAvailable, available, isLoading } = useStockAvailability({
    productId: product.id,
    storeId,
    quantity: 1
  });

  const handleAddToCart = () => {
    if (!isAvailable) {
      toast.error('Produto sem estoque disponível');
      return;
    }

    onAddToCart(product, 1);
    toast.success('Produto adicionado ao carrinho!');
  };

  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(priceInCents / 100);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Imagem do produto */}
      <div className="aspect-square bg-gray-100 relative">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ShoppingCart size={48} />
          </div>
        )}
        
        {/* Badge de estoque no canto superior direito */}
        <div className="absolute top-2 right-2">
          <StockBadge
            productId={product.id}
            storeId={storeId}
            quantity={1}
            showQuantity={false}
            size="sm"
          />
        </div>
      </div>

      {/* Informações do produto */}
      <CardHeader>
        <h3 className="font-semibold text-lg line-clamp-2">
          {product.name}
        </h3>
        {product.brand && (
          <p className="text-sm text-muted-foreground">{product.brand}</p>
        )}
      </CardHeader>

      <CardContent>
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {product.description}
          </p>
        )}
        
        {/* Preço */}
        <div className="text-2xl font-bold text-primary">
          {formatPrice(product.price)}
        </div>

        {/* Badge de estoque com quantidade */}
        <div className="mt-3">
          <StockBadge
            productId={product.id}
            storeId={storeId}
            quantity={1}
            showQuantity={true}
            size="md"
          />
        </div>
      </CardContent>

      {/* Botão de adicionar ao carrinho */}
      <CardFooter>
        <Button
          onClick={handleAddToCart}
          disabled={!isAvailable || isLoading}
          className="w-full"
        >
          {isLoading ? (
            'Verificando...'
          ) : !isAvailable ? (
            'Sem estoque'
          ) : (
            <>
              <ShoppingCart className="mr-2" size={16} />
              Adicionar ao Carrinho
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

/**
 * Grid de produtos com estoque
 */
export interface ProductGridWithStockProps {
  products: Product[];
  storeId: number;
  onAddToCart: (product: Product, quantity: number) => void;
}

export function ProductGridWithStock({
  products,
  storeId,
  onAddToCart
}: ProductGridWithStockProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCardWithStock
          key={product.id}
          product={product}
          storeId={storeId}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}
