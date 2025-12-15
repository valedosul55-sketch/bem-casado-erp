import crypto from 'crypto';

/**
 * Gera payload PIX Copia e Cola (EMV) para pagamento
 * Padrão Banco Central do Brasil
 */

interface PixPayload {
  pixKey: string; // Chave PIX (CNPJ, email, telefone, etc)
  description: string; // Descrição do pagamento
  merchantName: string; // Nome do beneficiário
  merchantCity: string; // Cidade do beneficiário
  amount: number; // Valor em reais
  txid?: string; // ID da transação (opcional)
}

/**
 * Calcula CRC16 CCITT para validação do payload PIX
 */
function crc16(payload: string): string {
  let crc = 0xFFFF;
  
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Formata campo EMV
 */
function emvField(id: string, value: string): string {
  const length = value.length.toString().padStart(2, '0');
  return `${id}${length}${value}`;
}

/**
 * Gera payload PIX Copia e Cola
 */
export function generatePixPayload(data: PixPayload): string {
  const {
    pixKey,
    description,
    merchantName,
    merchantCity,
    amount,
    txid = crypto.randomBytes(16).toString('hex').substring(0, 25)
  } = data;

  // Payload Format Indicator
  let payload = emvField('00', '01');

  // Merchant Account Information
  let merchantAccount = emvField('00', 'BR.GOV.BCB.PIX'); // GUI
  merchantAccount += emvField('01', pixKey); // Chave PIX
  if (description) {
    merchantAccount += emvField('02', description.substring(0, 72)); // Descrição (máx 72 chars)
  }
  payload += emvField('26', merchantAccount);

  // Merchant Category Code (comércio varejista)
  payload += emvField('52', '5411');

  // Transaction Currency (986 = BRL)
  payload += emvField('53', '986');

  // Transaction Amount
  if (amount > 0) {
    payload += emvField('54', amount.toFixed(2));
  }

  // Country Code
  payload += emvField('58', 'BR');

  // Merchant Name
  payload += emvField('59', merchantName.substring(0, 25));

  // Merchant City
  payload += emvField('60', merchantCity.substring(0, 15));

  // Additional Data Field Template
  let additionalData = emvField('05', txid); // Reference Label (TXID)
  payload += emvField('62', additionalData);

  // CRC16
  payload += '6304'; // ID 63 (CRC16), length 04
  const crc = crc16(payload);
  payload += crc;

  return payload;
}

/**
 * Gera PIX para a Bem Casado Alimentos
 */
export function generateBemCasadoPix(amount: number, orderId: string): string {
  return generatePixPayload({
    pixKey: '14295537000130', // CNPJ da Bem Casado
    description: `Pedido #${orderId}`,
    merchantName: 'BEM CASADO ALIMENTOS',
    merchantCity: 'SAO JOSE CAMPOS',
    amount,
    txid: orderId.substring(0, 25)
  });
}
