import { describe, it, expect } from 'vitest';
import { sendPixConfirmationEmail } from './email';

describe('Email SMTP', () => {
  it('deve enviar email de teste com credenciais SMTP', async () => {
    // Verificar se credenciais estão configuradas
    expect(process.env.SMTP_EMAIL_USER).toBeDefined();
    expect(process.env.SMTP_EMAIL_PASS).toBeDefined();
    
    console.log('[Test] Testando envio de email para:', process.env.SMTP_EMAIL_USER);
    
    // Tentar enviar email de teste
    await sendPixConfirmationEmail({
      to: 'diretoria@arrozvaledosul.com.br',
      customerName: 'Teste Sistema',
      orderId: 99999,
      totalAmount: 10000, // R$ 100,00
      items: [
        {
          productName: 'Arroz Teste 5kg',
          quantity: 2,
          unitPrice: 5000,
        },
      ],
      pixCode: '00020126330014br.gov.bcb.pix0111142955370001305204000053039865802BR5925Bem Casado Alimentos Ltda6009SAO PAULO62070503***63041D3A',
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020126330014br.gov.bcb.pix0111142955370001305204000053039865802BR5925Bem%20Casado%20Alimentos%20Ltda6009SAO%20PAULO62070503***63041D3A',
    });
    
    console.log('[Test] ✅ Email enviado com sucesso!');
  }, 30000); // 30 segundos de timeout
});
