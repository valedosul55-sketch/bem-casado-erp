/**
 * Utilitários de validação de cartão de crédito
 * Implementa algoritmo de Luhn e outras validações de segurança
 */

export type CardBrand = 'visa' | 'mastercard' | 'elo' | 'amex' | 'hipercard' | 'unknown';

/**
 * Algoritmo de Luhn para validar número de cartão
 * https://en.wikipedia.org/wiki/Luhn_algorithm
 */
export function validateCardNumber(cardNumber: string): boolean {
  // Remove espaços e caracteres não numéricos
  const cleaned = cardNumber.replace(/\D/g, '');
  
  // Cartão deve ter entre 13 e 19 dígitos
  if (cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }
  
  let sum = 0;
  let isEven = false;
  
  // Percorre de trás para frente
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

/**
 * Detecta a bandeira do cartão baseado no número
 */
export function detectCardBrand(cardNumber: string): CardBrand {
  const cleaned = cardNumber.replace(/\D/g, '');
  
  // Visa: começa com 4
  if (/^4/.test(cleaned)) {
    return 'visa';
  }
  
  // Mastercard: 51-55 ou 2221-2720
  if (/^5[1-5]/.test(cleaned) || /^2(2(2[1-9]|[3-9]\d)|[3-6]\d{2}|7([01]\d|20))/.test(cleaned)) {
    return 'mastercard';
  }
  
  // Elo: vários BINs específicos
  if (/^(4011|4312|4389|4514|4576|5041|5066|5067|5090|6277|6362|6363|6504|6505|6516|6550)/.test(cleaned)) {
    return 'elo';
  }
  
  // American Express: 34 ou 37
  if (/^3[47]/.test(cleaned)) {
    return 'amex';
  }
  
  // Hipercard: 38 ou 60
  if (/^(38|60)/.test(cleaned)) {
    return 'hipercard';
  }
  
  return 'unknown';
}

/**
 * Valida data de validade do cartão (MM/AA)
 */
export function validateExpiryDate(expiry: string): { valid: boolean; message?: string } {
  const cleaned = expiry.replace(/\D/g, '');
  
  if (cleaned.length !== 4) {
    return { valid: false, message: 'Data inválida. Use MM/AA' };
  }
  
  const month = parseInt(cleaned.substring(0, 2), 10);
  const year = parseInt(cleaned.substring(2, 4), 10);
  
  if (month < 1 || month > 12) {
    return { valid: false, message: 'Mês inválido' };
  }
  
  // Ano atual (últimos 2 dígitos)
  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;
  
  // Cartão expirado
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return { valid: false, message: 'Cartão expirado' };
  }
  
  // Validade muito distante (mais de 10 anos)
  if (year > currentYear + 10) {
    return { valid: false, message: 'Data inválida' };
  }
  
  return { valid: true };
}

/**
 * Valida CVV baseado na bandeira
 */
export function validateCVV(cvv: string, brand: CardBrand): { valid: boolean; message?: string } {
  const cleaned = cvv.replace(/\D/g, '');
  
  // American Express usa 4 dígitos, outros usam 3
  const expectedLength = brand === 'amex' ? 4 : 3;
  
  if (cleaned.length !== expectedLength) {
    return { 
      valid: false, 
      message: `CVV deve ter ${expectedLength} dígitos` 
    };
  }
  
  return { valid: true };
}

/**
 * Formata número do cartão com espaços
 * Exemplo: 1234567890123456 → 1234 5678 9012 3456
 */
export function formatCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\D/g, '');
  const brand = detectCardBrand(cleaned);
  
  // American Express: 4-6-5
  if (brand === 'amex') {
    return cleaned.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3').trim();
  }
  
  // Outros: 4-4-4-4
  return cleaned.replace(/(\d{4})/g, '$1 ').trim();
}

/**
 * Formata data de validade (MM/AA)
 */
export function formatExpiryDate(expiry: string): string {
  const cleaned = expiry.replace(/\D/g, '');
  
  if (cleaned.length >= 2) {
    return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
  }
  
  return cleaned;
}

/**
 * Mascara número do cartão para exibição segura
 * Exemplo: 1234567890123456 → **** **** **** 3456
 */
export function maskCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (cleaned.length < 4) {
    return '*'.repeat(cleaned.length);
  }
  
  const lastFour = cleaned.slice(-4);
  const maskedPart = '*'.repeat(cleaned.length - 4);
  
  return formatCardNumber(maskedPart + lastFour);
}

/**
 * Valida nome no cartão
 */
export function validateCardHolderName(name: string): { valid: boolean; message?: string } {
  const trimmed = name.trim();
  
  if (trimmed.length < 3) {
    return { valid: false, message: 'Nome muito curto' };
  }
  
  if (trimmed.length > 26) {
    return { valid: false, message: 'Nome muito longo (máx 26 caracteres)' };
  }
  
  // Deve conter apenas letras e espaços
  if (!/^[A-Za-zÀ-ÿ\s]+$/.test(trimmed)) {
    return { valid: false, message: 'Nome deve conter apenas letras' };
  }
  
  // Deve ter pelo menos nome e sobrenome
  const parts = trimmed.split(/\s+/);
  if (parts.length < 2) {
    return { valid: false, message: 'Digite nome e sobrenome' };
  }
  
  return { valid: true };
}

/**
 * Validação completa do cartão
 */
export function validateCard(data: {
  cardNumber: string;
  cardHolderName: string;
  expiryDate: string;
  cvv: string;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  // Valida número
  if (!validateCardNumber(data.cardNumber)) {
    errors.cardNumber = 'Número de cartão inválido';
  }
  
  // Valida nome
  const nameValidation = validateCardHolderName(data.cardHolderName);
  if (!nameValidation.valid) {
    errors.cardHolderName = nameValidation.message || 'Nome inválido';
  }
  
  // Valida validade
  const expiryValidation = validateExpiryDate(data.expiryDate);
  if (!expiryValidation.valid) {
    errors.expiryDate = expiryValidation.message || 'Data inválida';
  }
  
  // Valida CVV
  const brand = detectCardBrand(data.cardNumber);
  const cvvValidation = validateCVV(data.cvv, brand);
  if (!cvvValidation.valid) {
    errors.cvv = cvvValidation.message || 'CVV inválido';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Detecta possíveis tentativas de fraude baseado em padrões
 */
export function detectFraudPatterns(data: {
  cardNumber: string;
  attempts: number;
  timeWindow: number; // em segundos
}): { suspicious: boolean; reasons: string[] } {
  const reasons: string[] = [];
  
  // Muitas tentativas em pouco tempo
  if (data.attempts > 3 && data.timeWindow < 60) {
    reasons.push('Múltiplas tentativas em curto período');
  }
  
  // Número sequencial (1234567890...)
  const cleaned = data.cardNumber.replace(/\D/g, '');
  let sequential = 0;
  for (let i = 0; i < cleaned.length - 1; i++) {
    if (parseInt(cleaned[i + 1]) === parseInt(cleaned[i]) + 1) {
      sequential++;
    }
  }
  if (sequential > 6) {
    reasons.push('Número de cartão com padrão sequencial suspeito');
  }
  
  // Todos os dígitos iguais (1111111111...)
  if (/^(\d)\1+$/.test(cleaned)) {
    reasons.push('Número de cartão com dígitos repetidos');
  }
  
  return {
    suspicious: reasons.length > 0,
    reasons,
  };
}
