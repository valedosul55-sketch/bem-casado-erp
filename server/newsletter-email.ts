import { Resend } from 'resend';

/**
 * Módulo de envio de emails para newsletter via Resend
 */

interface NewsletterEmailParams {
  to: string;
  firstName?: string;
  couponCode: string;
}

/**
 * Envia email de boas-vindas para novo assinante da newsletter
 */
export async function sendNewsletterWelcomeEmail({
  to,
  firstName,
  couponCode,
}: NewsletterEmailParams): Promise<boolean> {
  console.log('[Newsletter Email] Iniciando envio via Resend...');
  console.log('[Newsletter Email] Destinatário:', to);
  console.log('[Newsletter Email] Cupom:', couponCode);

  try {
    // Obter API key do Resend
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error('[Newsletter Email] ❌ RESEND_API_KEY não configurada!');
      return false;
    }

    // Criar cliente Resend
    const resend = new Resend(resendApiKey);

    const name = firstName || 'Cliente';

    // Preparar email HTML
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ec4899 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
    .coupon-box { background: #fef3c7; border: 2px dashed #f59e0b; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px; }
    .coupon-code { font-size: 32px; font-weight: bold; color: #dc2626; letter-spacing: 2px; }
    .button { display: inline-block; background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 10px 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Bem-vindo à Newsletter Bem Casado!</h1>
    </div>
    
    <div class="content">
      <h2>Olá, ${name}!</h2>
      
      <p>Obrigado por se cadastrar na nossa newsletter! Estamos muito felizes em ter você conosco.</p>
      
      <p>Como agradecimento, preparamos um <strong>cupom de desconto exclusivo</strong> para você:</p>
      
      <div class="coupon-box">
        <p style="margin: 0 0 10px 0; font-size: 18px;">Seu cupom de desconto:</p>
        <div class="coupon-code">${couponCode}</div>
        <p style="margin: 10px 0 0 0; color: #059669; font-weight: bold;">5% de desconto em compras acima de R$ 30</p>
      </div>
      
      <p>Use este cupom na sua primeira compra e aproveite nossos preços de fábrica!</p>
      
      <div style="text-align: center;">
        <a href="https://loja.arrozbemcasado.com.br/loja/" class="button">
          Ir para a Loja
        </a>
      </div>
      
      <h3>📦 O que você vai receber:</h3>
      <ul>
        <li>✅ Ofertas exclusivas toda semana</li>
        <li>✅ Cupons de desconto especiais</li>
        <li>✅ Novidades e lançamentos em primeira mão</li>
        <li>✅ Dicas e receitas com nossos produtos</li>
      </ul>
      
      <p><strong>Horário de funcionamento:</strong><br>
      Sábado: 7h às 13h</p>
      
      <p><strong>Endereço:</strong><br>
      Av. Capão Grosso, 257 - Capão Grosso<br>
      São José dos Campos - SP</p>
      
      <p style="margin-top: 30px;">Até breve! 😊</p>
      <p><strong>Equipe Bem Casado</strong></p>
    </div>
    
    <div class="footer">
      <p>Você está recebendo este email porque se cadastrou na newsletter da Bem Casado.</p>
      <p>© 2025 Bem Casado Alimentos. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
    `;

    // Enviar email via Resend
    console.log('[Newsletter Email] 📤 Enviando email via Resend...');

    const { data, error } = await resend.emails.send({
      from: 'Bem Casado Alimentos <newsletter@arrozbemcasado.com.br>',
      to: [to],
      subject: '🎉 Bem-vindo! Seu cupom de 5% OFF está aqui',
      html: htmlContent,
    });

    if (error) {
      console.error('[Newsletter Email] ❌ Erro ao enviar via Resend:', error);
      return false;
    }

    console.log('[Newsletter Email] ✅ Email enviado com sucesso via Resend!');
    console.log('[Newsletter Email] Email ID:', data?.id);

    return true;
  } catch (error: any) {
    console.error('[Newsletter Email] ❌ Erro ao enviar email:', error);
    console.error('[Newsletter Email] Stack:', error.stack);
    return false;
  }
}
