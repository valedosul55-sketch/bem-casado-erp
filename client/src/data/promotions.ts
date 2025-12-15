export interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: number;
  productIds: string[];
  startDate: Date;
  endDate: Date;
  bannerColor: string;
  icon: string;
}

export const promotions: Promotion[] = [
  {
    id: 'promo-1',
    title: 'Super Desconto em Arroz!',
    description: 'Até 34% OFF em todos os tipos de arroz',
    discount: 34,
    productIds: ['arroz-parboilizado', 'arroz-branco', 'arroz-integral'],
    startDate: new Date('2024-11-19'),
    endDate: new Date('2024-11-30'),
    bannerColor: '#E63946',
    icon: '🍚',
  },
  {
    id: 'promo-2',
    title: 'Feijão em Promoção!',
    description: 'Leve 3, pague 2 em feijões selecionados',
    discount: 33,
    productIds: ['feijao-carioca', 'feijao-preto'],
    startDate: new Date('2024-11-19'),
    endDate: new Date('2024-11-25'),
    bannerColor: '#2A9D8F',
    icon: '🫘',
  },
  {
    id: 'promo-3',
    title: 'Combo Completo!',
    description: 'Arroz + Feijão + Açúcar com desconto especial',
    discount: 25,
    productIds: ['arroz-parboilizado', 'feijao-carioca', 'acucar-cristal'],
    startDate: new Date('2024-11-19'),
    endDate: new Date('2024-12-05'),
    bannerColor: '#F4A261',
    icon: '🛒',
  },
];

export function getActivePromotions(): Promotion[] {
  const now = new Date();
  return promotions.filter((promo) => promo.startDate <= now && promo.endDate >= now);
}

export function getPromotionForProduct(productId: string): Promotion | null {
  const activePromotions = getActivePromotions();
  return activePromotions.find((promo) => promo.productIds.includes(productId)) || null;
}

export function getRemainingTime(endDate: Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
} {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, expired: false };
}
