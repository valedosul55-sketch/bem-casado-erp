/**
 * Remove caracteres não numéricos de um documento
 */
export function cleanDocument(doc: string): string {
  return doc.replace(/\D/g, '');
}

/**
 * Valida CPF
 */
export function validateCPF(cpf: string): boolean {
  const cleanCPF = cleanDocument(cpf);
  
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Valida primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(9))) return false;
  
  // Valida segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
}

/**
 * Valida CNPJ
 */
export function validateCNPJ(cnpj: string): boolean {
  const cleanCNPJ = cleanDocument(cnpj);
  
  if (cleanCNPJ.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
  
  // Valida primeiro dígito verificador
  let sum = 0;
  let weight = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (digit !== parseInt(cleanCNPJ.charAt(12))) return false;
  
  // Valida segundo dígito verificador
  sum = 0;
  weight = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (digit !== parseInt(cleanCNPJ.charAt(13))) return false;
  
  return true;
}

/**
 * Valida CPF ou CNPJ automaticamente
 */
export function validateDocument(doc: string): boolean {
  const clean = cleanDocument(doc);
  if (clean.length === 11) return validateCPF(doc);
  if (clean.length === 14) return validateCNPJ(doc);
  return false;
}

/**
 * Formata CPF: 000.000.000-00
 */
export function formatCPF(cpf: string): string {
  const clean = cleanDocument(cpf);
  if (clean.length !== 11) return cpf;
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata CNPJ: 00.000.000/0000-00
 */
export function formatCNPJ(cnpj: string): string {
  const clean = cleanDocument(cnpj);
  if (clean.length !== 14) return cnpj;
  return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

/**
 * Formata CPF ou CNPJ automaticamente
 */
export function formatDocument(doc: string): string {
  const clean = cleanDocument(doc);
  if (clean.length <= 11) {
    // Formata como CPF progressivamente
    if (clean.length <= 3) return clean;
    if (clean.length <= 6) return clean.replace(/(\d{3})(\d+)/, '$1.$2');
    if (clean.length <= 9) return clean.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4');
  } else {
    // Formata como CNPJ progressivamente
    if (clean.length <= 2) return clean;
    if (clean.length <= 5) return clean.replace(/(\d{2})(\d+)/, '$1.$2');
    if (clean.length <= 8) return clean.replace(/(\d{2})(\d{3})(\d+)/, '$1.$2.$3');
    if (clean.length <= 12) return clean.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4');
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d+)/, '$1.$2.$3/$4-$5');
  }
}

/**
 * Detecta tipo de documento
 */
export function getDocumentType(doc: string): 'cpf' | 'cnpj' | 'unknown' {
  const clean = cleanDocument(doc);
  if (clean.length === 11) return 'cpf';
  if (clean.length === 14) return 'cnpj';
  return 'unknown';
}
