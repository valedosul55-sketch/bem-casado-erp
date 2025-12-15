export interface ProductInfo {
  id: string;
  name: string;
  brand: string;
  color: string;
  weight: string;
  price: number;
  priceUnit: string;
  unit?: string;
  tablePrice?: number;
  discount?: number;
  description: string;
  validity: string;
  lot: string;
  stock: number;
  image?: string;
  acceptsVoucher?: boolean;
}

export const products: ProductInfo[] = [
  {
    id: 'arroz-branco-1kg',
    name: 'Arroz Branco Tipo 1',
    brand: 'Bem Casado',
    color: '#DC143C',
    weight: 'Fardo 10kg (10 pacotes de 1kg)',
    price: 23.00,
    priceUnit: 'fardo',
    unit: '10 un. 1kg',
    tablePrice: 35.00,
    discount: 34,
    description: 'Kit com 10 unidades. Arroz Branco Tipo 1 Bem Casado vendido em fardos de 10kg (10 pacotes de 1kg). Subgrupo Polido, Classe Longo Fino. Grãos nobres selecionados.',
    validity: '12 meses',
    lot: 'BC-2024-11',
    stock: 300,
    image: '/produto-arroz-branco-1kg.webp',
    acceptsVoucher: true,
  },
  {
    id: 'arroz-integral-1kg',
    name: 'Arroz Integral Tipo 1',
    brand: 'Bem Casado',
    color: '#8B6914',
    weight: 'Fardo 10kg (10 pacotes de 1kg)',
    price: 23.00,
    priceUnit: 'fardo',
    unit: '10 un. 1kg',
    tablePrice: 35.00,
    discount: 34,
    description: 'Kit com 10 unidades. Arroz Integral Tipo 1 Bem Casado vendido em fardos de 10kg (10 pacotes de 1kg). Subgrupo Integral, Classe Longo Fino. Rico em fibras e nutrientes.',
    validity: '12 meses',
    lot: 'BC-2024-11',
    stock: 100,
    image: '/produto-arroz-integral-1kg.webp',
    acceptsVoucher: true,
  },
  {
    id: 'feijao-carioca-1kg',
    name: 'Feijão Carioca Tipo 1',
    brand: 'Bem Casado',
    color: '#D2691E',
    weight: 'Fardo 10kg (10 pacotes de 1kg)',
    price: 39.90,
    priceUnit: 'fardo',
    unit: '10 un. 1kg',
    tablePrice: 50.00,
    discount: 20,
    description: 'Kit com 10 unidades. Feijão Carioca Tipo 1 Bem Casado vendido em fardos de 10kg (10 pacotes de 1kg). Feijão Comum, Classe Cores. Grãos selecionados de alta qualidade.',
    validity: '12 meses',
    lot: 'BC-2024-10',
    stock: 200,
    image: '/produto-feijao-carioca-1kg.webp',
    acceptsVoucher: true,
  },
  {
    id: 'feijao-preto-1kg',
    name: 'Feijão Preto Tipo 1',
    brand: 'Bem Casado',
    color: '#2C1810',
    weight: 'Fardo 10kg (10 pacotes de 1kg)',
    price: 29.90,
    priceUnit: 'fardo',
    unit: '10 un. 1kg',
    tablePrice: 40.00,
    discount: 25,
    description: 'Kit com 10 unidades. Feijão Preto Tipo 1 Bem Casado vendido em fardos de 10kg (10 pacotes de 1kg). Feijão Comum, Classe Preto. Ideal para feijoada e pratos tradicionais.',
    validity: '12 meses',
    lot: 'BC-2024-09',
    stock: 150,
    image: '/produto-feijao-preto-1kg.webp',
    acceptsVoucher: true,
  },
  {
    id: 'acucar-cristal-1kg',
    name: 'Açúcar Cristal',
    brand: 'Bem Casado',
    color: '#F5F5DC',
    weight: 'Fardo 10kg (10 pacotes de 1kg)',
    price: 29.90,
    priceUnit: 'fardo',
    unit: '10 un. 1kg',
    tablePrice: 38.00,
    discount: 24,
    description: 'Kit com 10 unidades. Açúcar Cristal Bem Casado vendido em fardos de 10kg (10 pacotes de 1kg). Grupo 1, Classe Cristal Branco, Tipo Cristal. Cristais uniformes e brilhantes.',
    validity: '24 meses',
    lot: 'BC-2024-12',
    stock: 150,
    image: '/produto-acucar-cristal-1kg.png',
    acceptsVoucher: true,
  },
];

export function getProductById(id: string): ProductInfo | undefined {
  return products.find(p => p.id === id);
}

export function getProductByIndex(index: number): ProductInfo {
  return products[index % products.length];
}
