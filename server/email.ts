import { Resend } from 'resend';

// Configuração do Resend API
const resend = new Resend(process.env.RESEND_API_KEY);

// Email de origem (deve ser um domínio verificado no Resend ou usar onboarding@resend.dev para testes)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const FROM_NAME = 'ERP Bem Casado';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Usar any para evitar problemas de tipagem com a versão do Resend
    const emailData: any = {
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [options.to],
      subject: options.subject,
    };

    if (options.text) {
      emailData.text = options.text;
    }
    if (options.html) {
      emailData.html = options.html;
    }

    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      console.error('[Email] Failed to send email:', error);
      return false;
    }

    console.log('[Email] Message sent:', data?.id);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send email:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(
  email: string,
  resetLink: string,
  userName: string
): Promise<boolean> {
  const subject = 'Recuperação de Senha - ERP Bem Casado';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f97316, #fbbf24); padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { color: white; margin: 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .button:hover { background: #ea580c; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 10px; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍰 BEM CASADO</h1>
        </div>
        <div class="content">
          <h2>Olá, ${userName}!</h2>
          <p>Recebemos uma solicitação para redefinir a senha da sua conta no ERP Bem Casado.</p>
          <p>Clique no botão abaixo para criar uma nova senha:</p>
          <p style="text-align: center;">
            <a href="${resetLink}" class="button">Redefinir Minha Senha</a>
          </p>
          <p>Ou copie e cole o link abaixo no seu navegador:</p>
          <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">
            ${resetLink}
          </p>
          <div class="warning">
            <strong>⚠️ Importante:</strong> Este link expira em 1 hora. Se você não solicitou a redefinição de senha, ignore este email.
          </div>
        </div>
        <div class="footer">
          <p>Este é um email automático. Por favor, não responda.</p>
          <p>© ${new Date().getFullYear()} Bem Casado - Sistema de Gestão para Confeitaria</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Olá, ${userName}!

Recebemos uma solicitação para redefinir a senha da sua conta no ERP Bem Casado.

Clique no link abaixo para criar uma nova senha:
${resetLink}

Este link expira em 1 hora. Se você não solicitou a redefinição de senha, ignore este email.

---
ERP Bem Casado - Sistema de Gestão para Confeitaria
  `;

  return sendEmail({
    to: email,
    subject,
    text,
    html,
  });
}
