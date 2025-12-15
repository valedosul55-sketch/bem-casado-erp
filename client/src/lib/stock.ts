import { ProductInfo, products } from '@/data/products';

export const LOW_STOCK_THRESHOLD = 50;
export const CRITICAL_STOCK_THRESHOLD = 20;

export function isLowStock(stock: number): boolean {
  return stock < LOW_STOCK_THRESHOLD;
}

export function isCriticalStock(stock: number): boolean {
  return stock < CRITICAL_STOCK_THRESHOLD;
}

export function getStockStatus(stock: number): {
  status: 'high' | 'low' | 'critical';
  label: string;
  color: string;
} {
  if (stock >= LOW_STOCK_THRESHOLD) {
    return {
      status: 'high',
      label: 'Disponível',
      color: 'green',
    };
  } else if (stock >= CRITICAL_STOCK_THRESHOLD) {
    return {
      status: 'low',
      label: 'Estoque Baixo',
      color: 'orange',
    };
  } else {
    return {
      status: 'critical',
      label: 'Últimas Unidades',
      color: 'red',
    };
  }
}

export function getSimilarProducts(product: ProductInfo, limit: number = 3): ProductInfo[] {
  // Lógica para encontrar produtos similares
  const similar: ProductInfo[] = [];
  
  // 1. Produtos da mesma marca
  const sameBrand = products.filter(
    (p) => p.id !== product.id && p.brand === product.brand
  );
  similar.push(...sameBrand);
  
  // 2. Produtos da mesma categoria (baseado no nome)
  const category = product.name.split(' ')[0]; // Ex: "Arroz", "Feijão"
  const sameCategory = products.filter(
    (p) => p.id !== product.id && p.name.startsWith(category) && !similar.includes(p)
  );
  similar.push(...sameCategory);
  
  // 3. Produtos com preço similar (±30%)
  const priceRange = product.price * 0.3;
  const similarPrice = products.filter(
    (p) =>
      p.id !== product.id &&
      Math.abs(p.price - product.price) <= priceRange &&
      !similar.includes(p)
  );
  similar.push(...similarPrice);
  
  // Retornar apenas produtos com estoque disponível, priorizando os com mais estoque
  return similar
    .filter((p) => p.stock > 0)
    .sort((a, b) => b.stock - a.stock)
    .slice(0, limit);
}
