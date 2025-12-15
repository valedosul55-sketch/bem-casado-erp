import { ProductInfo } from '@/data/products';
import { FilterOptions } from '@/components/SearchAndFilters';
import { getPromotionForProduct } from '@/data/promotions';

export function applyFilters(
  products: ProductInfo[],
  filters: FilterOptions
): ProductInfo[] {
  let filtered = [...products];

  // Filtro de busca por nome ou marca
  if (filters.searchQuery.trim() !== '') {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query)
    );
  }

  // Filtro por categoria
  if (filters.category !== 'all') {
    filtered = filtered.filter((p) => {
      const productName = p.name.toLowerCase();
      switch (filters.category) {
        case 'arroz':
          return productName.includes('arroz');
        case 'feijao':
          return productName.includes('feijão') || productName.includes('feijao');
        case 'acucar':
          return productName.includes('açúcar') || productName.includes('acucar');
        default:
          return true;
      }
    });
  }

  // Filtro por faixa de preço
  filtered = filtered.filter(
    (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
  );

  // Filtro de promoções
  if (filters.onlyPromotions) {
    filtered = filtered.filter((p) => getPromotionForProduct(p.id) !== null);
  }

  // Ordenação
  switch (filters.sortBy) {
    case 'name-asc':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      filtered.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'price-asc':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'stock-desc':
      filtered.sort((a, b) => b.stock - a.stock);
      break;
  }

  return filtered;
}

export function getProductIds(products: ProductInfo[]): Set<string> {
  return new Set(products.map((p) => p.id));
}
