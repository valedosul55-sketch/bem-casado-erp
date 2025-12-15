import { useState, useMemo } from 'react';
import { ProductInfo } from '@/data/products';
import { trpc } from '@/lib/trpc';
import ProductDetailModal from './ProductDetailModal';
import HowToGetThereModal from './HowToGetThereModal';
import SearchAndFilters, { FilterOptions } from './SearchAndFilters';
import ProductGridView from './ProductGridView';
import { applyFilters } from '@/lib/filters';
import { LayoutGrid, Store, MapPin, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

// Função para determinar cor por categoria
const getCategoryColor = (category?: string | null, name?: string | null) => {
  const productName = (name || '').toLowerCase();
  const cat = (category || '').toLowerCase();
  
  if (cat.includes('arroz') || productName.includes('arroz')) {
    if (productName.includes('integral')) return '#8B6914';
    return '#DC143C';
  }
  if (cat.includes('feijao') || productName.includes('feijão') || productName.includes('feijao')) {
    if (productName.includes('preto')) return '#2C1810';
    return '#D2691E';
  }
  if (cat.includes('acucar') || cat.includes('açúcar') || productName.includes('açúcar') || productName.includes('acucar')) {
    return '#F5F5DC';
  }
  return '#DC143C'; // Cor padrão
};

export default function StoreVisualization() {
  const { addItem } = useCart();
  
  // Buscar produtos do banco de dados
  const { data: dbProducts, isLoading } = trpc.products.listActive.useQuery();
  
  // Converter produtos do banco para o formato esperado
  const products: ProductInfo[] = useMemo(() => {
    if (!dbProducts) return [];
    return dbProducts.map(p => ({
      id: `product-${p.id}`,
      name: p.name || '',
      brand: p.brand || 'Bem Casado',
      color: getCategoryColor(p.category, p.name),
      weight: 'Fardo 10kg (10 pacotes de 1kg)',
      price: (p.price || 0) / 100, // Converter centavos para reais
      priceUnit: 'fardo',
      unit: '10 un. 1kg',
      tablePrice: ((p.price || 0) / 100) * 1.5,
      discount: 34,
      description: p.description || '',
      validity: '12 meses',
      lot: 'BC-2024-11',
      stock: p.stock || 0,
      image: p.imageUrl || '',
      acceptsVoucher: true,
    }));
  }, [dbProducts]);
  const [displayMode, setDisplayMode] = useState<'store' | 'grid'>('store');
  const [selectedProduct, setSelectedProduct] = useState<ProductInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHowToGetThereModalOpen, setIsHowToGetThereModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    category: 'all',
    priceRange: [0, 100],
    sortBy: 'name-asc',
    onlyPromotions: false,
  });

  const filteredProducts = useMemo(
    () => applyFilters(products, filters),
    [products, filters]
  );

  const handleProductClick = (product: ProductInfo) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Mostrar loading enquanto busca produtos
  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Busca e Filtros */}
      <SearchAndFilters
        filters={filters}
        onFiltersChange={setFilters}
        resultCount={filteredProducts.length}
        totalCount={products.length}
      />

      {/* Controles de Visualização */}
      <div className="flex gap-2">
        <Button
          variant={displayMode === 'store' ? 'default' : 'outline'}
          onClick={() => setDisplayMode('store')}
          className="flex items-center gap-2"
        >
          <Store className="h-4 w-4" />
          Visualização da Loja
        </Button>
        <Button
          variant={displayMode === 'grid' ? 'default' : 'outline'}
          onClick={() => setDisplayMode('grid')}
          className="flex items-center gap-2"
        >
          <LayoutGrid className="h-4 w-4" />
          Grade de Produtos
        </Button>
      </div>

      {/* Conteúdo */}
      {displayMode === 'store' ? (
        <Card className="p-6">
          <div className="space-y-6">
            {/* Imagem da Fachada */}
            <div>
              <img
                src="/galpao-bem-casado-final.jpg"
                alt="Loja de Fábrica Bem Casado com Produtos Organizados"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>

            {/* Informações da Loja */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h3 className="font-bold mb-2">Produtos</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Total: {products.length} produtos</p>
                  <p>Organizados em pallets</p>
                  <p>2 caixas registradoras</p>
                </div>
              </Card>
              <Card className="p-4">
                <h3 className="font-bold mb-3">Localização</h3>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Av. Capão Grosso, 257<br/>Capão Grosso - São José dos Campos - SP</p>
                  <button
                    onClick={() => setIsHowToGetThereModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm transition-all hover:scale-105 shadow-lg hover:shadow-xl w-full"
                  >
                    <MapPin className="h-5 w-5" />
                    Como Chegar
                  </button>
                </div>
              </Card>
            </div>

            {/* Grade de Produtos Compacta */}
            <div>
              <h3 className="text-xl font-bold mb-4">Produtos Disponíveis</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredProducts.slice(0, 10).map((product) => (
                  <Card
                    key={product.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
                  >
                    <div 
                      className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden cursor-pointer relative"
                      onClick={() => handleProductClick(product)}
                    >
                      {product.image ? (
                        <>
                          {/* Skeleton loader - aparece enquanto carrega */}
                          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-contain relative z-10"
                            loading="eager"
                            onLoad={(e) => {
                              // Remove skeleton quando imagem carregar
                              const skeleton = (e.target as HTMLImageElement).previousElementSibling;
                              if (skeleton) skeleton.remove();
                            }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = document.createElement('div');
                              fallback.style.width = '100%';
                              fallback.style.height = '100%';
                              fallback.style.backgroundColor = product.color;
                              fallback.className = 'relative z-10';
                              target.parentElement?.appendChild(fallback);
                            }}
                          />
                        </>
                      ) : (
                        <div
                          className="w-full h-full relative z-10"
                          style={{ backgroundColor: product.color }}
                        />
                      )}
                    </div>
                    <div className="p-3 flex flex-col gap-2 flex-1">
                      <h4 
                        className="font-semibold text-sm line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleProductClick(product)}
                      >
                        {product.name}
                      </h4>
                      <p className="text-xs font-semibold text-gray-700">{product.unit || '10 un.'}</p>
                      <p className="text-primary font-bold text-lg">R$ {product.price.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Estoque: {product.stock}</p>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          addItem(product, 1);
                          toast.success('Produto adicionado!', {
                            description: `${product.name} adicionado ao carrinho.`,
                          });
                        }}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all duration-200 font-bold mt-auto"
                        size="sm"
                      >
                        <ShoppingCart className="mr-1 h-4 w-4" />
                        Adicionar
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
              {filteredProducts.length > 10 && (
                <div className="text-center mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setDisplayMode('grid')}
                  >
                    Ver todos os {filteredProducts.length} produtos
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <ProductGridView
            products={filteredProducts}
            onProductClick={handleProductClick}
          />
        </Card>
      )}

      {/* Modal de Detalhes */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProduct(null);
          }}
        />
      )}

      {/* Modal Como Chegar */}
      <HowToGetThereModal
        open={isHowToGetThereModalOpen}
        onOpenChange={setIsHowToGetThereModalOpen}
      />
    </div>
  );
}
