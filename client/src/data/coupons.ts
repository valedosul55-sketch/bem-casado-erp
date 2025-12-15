export interface Coupon {
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  expiryDate?: Date;
  active: boolean;
}

export const coupons: Coupon[] = [
  {
    code: 'BEMVINDO10',
    description: 'Desconto de boas-vindas',
    type: 'percentage',
    value: 10,
    minPurchase: 50,
    active: true,
  },
  {
    code: 'FABRICA15',
    description: 'Desconto especial da fábrica',
    type: 'percentage',
    value: 15,
    minPurchase: 100,
    active: true,
  },
  {
    code: 'PRIMEIRACOMPRA',
    description: 'Primeira compra na loja',
    type: 'percentage',
    value: 20,
    minPurchase: 80,
    maxDiscount: 30,
    active: true,
  },
  {
    code: 'DESCONTO5',
    description: 'R$ 5 de desconto',
    type: 'fixed',
    value: 5,
    minPurchase: 30,
    active: true,
  },
  {
    code: 'ATACADO20',
    description: 'Desconto para compras em grande volume',
    type: 'percentage',
    value: 20,
    minPurchase: 500,
    maxDiscount: 200,
    active: true,
  },
  {
    code: 'NEWSLETTER5',
    description: 'Desconto exclusivo para assinantes da newsletter',
    type: 'percentage',
    value: 5,
    minPurchase: 30,
    active: true,
  },
];

export function validateCoupon(code: string, totalAmount: number): {
  valid: boolean;
  coupon?: Coupon;
  message: string;
} {
  const coupon = coupons.find(
    (c) => c.code.toUpperCase() === code.toUpperCase() && c.active
  );

  if (!coupon) {
    return {
      valid: false,
      message: 'Cupom inválido ou expirado',
    };
  }

  if (coupon.minPurchase && totalAmount < coupon.minPurchase) {
    return {
      valid: false,
      coupon,
      message: `Compra mínima de R$ ${coupon.minPurchase.toFixed(2)} necessária para este cupom`,
    };
  }

  if (coupon.expiryDate && new Date() > coupon.expiryDate) {
    return {
      valid: false,
      coupon,
      message: 'Este cupom expirou',
    };
  }

  return {
    valid: true,
    coupon,
    message: `Cupom aplicado: ${coupon.description}`,
  };
}

export function calculateDiscount(coupon: Coupon, totalAmount: number): number {
  if (coupon.type === 'percentage') {
    const discount = (totalAmount * coupon.value) / 100;
    if (coupon.maxDiscount) {
      return Math.min(discount, coupon.maxDiscount);
    }
    return discount;
  } else {
    return Math.min(coupon.value, totalAmount);
  }
}
