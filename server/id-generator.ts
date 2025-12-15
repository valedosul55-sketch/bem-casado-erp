/**
 * Utilitário para geração de IDs com data/hora
 * Formato: PREFIXO_YYYYMMDD_HHMMSS
 */

/**
 * Formata data/hora no formato YYYYMMDD_HHMMSS_mmm (com milissegundos)
 */
function formatTimestamp(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
  
  return `${year}${month}${day}_${hours}${minutes}${seconds}_${milliseconds}`;
}

/**
 * Gera ID único com prefixo e timestamp
 * @param prefix Prefixo do ID (ex: VENDA, PIX, PEDIDO)
 * @returns ID no formato PREFIXO_YYYYMMDD_HHMMSS_mmm
 */
export function generateIdWithTimestamp(prefix: string): string {
  const timestamp = formatTimestamp();
  return `${prefix}_${timestamp}`;
}

/**
 * Gera referência para NFC-e
 * Formato: VENDA_YYYYMMDD_HHMMSS_mmm
 */
export function generateNFCeReference(): string {
  return generateIdWithTimestamp('VENDA');
}

/**
 * Gera referência para PIX
 * Formato: PIX_YYYYMMDD_HHMMSS_mmm
 */
export function generatePixReference(): string {
  return generateIdWithTimestamp('PIX');
}

/**
 * Gera referência para pedido
 * Formato: PEDIDO_YYYYMMDD_HHMMSS_mmm
 */
export function generateOrderReference(): string {
  return generateIdWithTimestamp('PEDIDO');
}

/**
 * Extrai data/hora de um ID gerado
 * @param id ID no formato PREFIXO_YYYYMMDD_HHMMSS_mmm
 * @returns Date object ou null se formato inválido
 */
export function extractDateFromId(id: string): Date | null {
  try {
    const parts = id.split('_');
    if (parts.length < 3) return null;
    
    const dateStr = parts[1]; // YYYYMMDD
    const timeStr = parts[2]; // HHMMSS
    const msStr = parts[3] || '000'; // mmm (milissegundos)
    
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));
    const hours = parseInt(timeStr.substring(0, 2));
    const minutes = parseInt(timeStr.substring(2, 4));
    const seconds = parseInt(timeStr.substring(4, 6));
    const milliseconds = parseInt(msStr);
    
    return new Date(year, month, day, hours, minutes, seconds, milliseconds);
  } catch (error) {
    return null;
  }
}

/**
 * Formata ID para exibição legível
 * @param id ID no formato PREFIXO_YYYYMMDD_HHMMSS_mmm
 * @returns String formatada (ex: "VENDA 06/12/2025 17:30:45")
 */
export function formatIdForDisplay(id: string): string {
  const date = extractDateFromId(id);
  if (!date) return id;
  
  const prefix = id.split('_')[0];
  const dateStr = date.toLocaleDateString('pt-BR');
  const timeStr = date.toLocaleTimeString('pt-BR');
  
  return `${prefix} ${dateStr} ${timeStr}`;
}
