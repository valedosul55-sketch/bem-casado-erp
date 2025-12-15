import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import { db } from "./db";
import { alertLogs } from "../drizzle/schema";

const execAsync = promisify(exec);

interface SendPixEmailParams {
  to: string;
  customerName: string;
  orderId: number;
  totalAmount: number;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
  pixCode: string;
  qrCodeUrl: string;
  couponCode?: string;
  discountAmount?: number;
}

/**
 * Cria transporter do Nodemailer com configurações SMTP do Gmail
 */
function createEmailTransporter() {
  const emailUser = process.env.SMTP_EMAIL_USER;
  const emailPass = process.env.SMTP_EMAIL_PASS;

  if (!emailUser || !emailPass) {
    throw new Error('Credenciais SMTP não configuradas. Configure SMTP_EMAIL_USER e SMTP_EMAIL_PASS.');
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true para 465, false para outras portas
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
}

/**
 * Envia email de confirmação de pedido PIX via Nodemailer
 */
interface SendLowStockAlertParams {
  to: string;
  storeName: string;
  productName: string;
  currentStock: number;
  minStock: number;
  unit: string;
}

/**
 * Envia alerta de estoque baixo por email
 */
export async function sendLowStockAlert(params: SendLowStockAlertParams): Promise<void> {
  const { to, storeName, productName, currentStock, minStock, unit } = params;

  const emailContent = `Olá Gerente,

O estoque de um produto atingiu o nível crítico na loja ${storeName}.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALERTA DE ESTOQUE BAIXO ⚠️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Produto: ${productName}
Loja: ${storeName}
Estoque Atual: ${currentStock} ${unit}
Estoque Mínimo: ${minStock} ${unit}

Por favor, providencie a reposição o mais breve possível.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bem Casado Alimentos - Sistema Automático
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  try {
    const transporter = createEmailTransporter();

    await transporter.sendMail({
      from: {
        name: 'Bem Casado Alimentos - Sistema',
        address: process.env.SMTP_EMAIL_USER || 'noreply@arrozbemcasado.com.br',
      },
      to,
      subject: `⚠️ Alerta de Estoque Baixo: ${productName} - ${storeName}`,
      text: emailContent,
    });

    console.log('[Email] Alerta de estoque baixo enviado para:', to);

    // Salvar log no banco de dados
    try {
      await db.insert(alertLogs).values({
        type: "low_stock",
        title: `Estoque Baixo: ${productName}`,
        message: `Produto ${productName} na loja ${storeName} atingiu nível crítico. Atual: ${currentStock} ${unit}, Mínimo: ${minStock} ${unit}.`,
        recipientEmail: to,
        status: "sent",
      });
    } catch (logError) {
      console.error("[EMAIL] Erro ao salvar log de alerta:", logError);
    }

  } catch (error) {
    console.error('[Email] Erro ao enviar alerta de estoque:', error);
    
    // Salvar log de erro no banco de dados
    try {
      await db.insert(alertLogs).values({
        type: "low_stock",
        title: `Falha no Envio: ${productName}`,
        message: `Erro ao enviar alerta para ${to}. Erro: ${error instanceof Error ? error.message : String(error)}`,
        recipientEmail: to,
        status: "failed",
      });
    } catch (logError) {
      console.error("[EMAIL] Erro ao salvar log de falha:", logError);
    }
  }
}

export async function sendPixConfirmationEmail(params: SendPixEmailParams): Promise<void> {
  const {
    to,
    customerName,
    orderId,
    totalAmount,
    items,
    pixCode,
    qrCodeUrl,
    couponCode,
    discountAmount = 0,
  } = params;

  // Baixar QR Code como imagem
  const qrCodePath = `/tmp/qrcode-${orderId}.png`;
  try {
    await execAsync(`curl -s "${qrCodeUrl}" -o "${qrCodePath}"`);
  } catch (error) {
    console.error('[Email] Erro ao baixar QR Code:', error);
    throw new Error('Falha ao baixar QR Code');
  }

  // Calcular subtotal
  const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

  // Montar lista de produtos
  const productsList = items
    .map((item, index) => 
      `${index + 1}. ${item.productName} - ${item.quantity}x - R$ ${((item.unitPrice * item.quantity) / 100).toFixed(2)}`
    )
    .join('\n');

  // Montar conteúdo do email
  const emailContent = `Olá ${customerName},

Seu pedido foi criado com sucesso! Abaixo estão os detalhes:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PEDIDO #${orderId}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRODUTOS:
${productsList}

RESUMO DO PEDIDO:
Subtotal: R$ ${(subtotal / 100).toFixed(2)}${discountAmount > 0 ? `
Desconto (${couponCode}): -R$ ${(discountAmount / 100).toFixed(2)}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL: R$ ${(totalAmount / 100).toFixed(2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGAMENTO VIA PIX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ ATENÇÃO: Este PIX expira em 10 minutos!

COMO PAGAR:
1. Abra o aplicativo do seu banco
2. Escolha a opção "Pagar com PIX"
3. Escaneie o QR Code anexado neste email
   OU
   Copie e cole o código abaixo:

${pixCode}

IMPORTANTE:
- O pagamento deve ser realizado em até 10 minutos
- Após o pagamento, você receberá uma confirmação
- Guarde este email como comprovante

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INFORMAÇÕES DA LOJA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bem Casado Alimentos
Fábrica de arroz
WhatsApp: (12) 3197-3400
Email: contato@arrozbemcasado.com.br

Horário de Funcionamento:
Sábados e Domingos: 7h às 13h
Fechado durante a semana

Dúvidas? Entre em contato pelo WhatsApp!

Obrigado pela preferência!
Equipe Bem Casado Alimentos`;

  try {
    // Criar transporter
    const transporter = createEmailTransporter();

    // Configurar email
    const mailOptions = {
      from: {
        name: 'Bem Casado Alimentos - Loja de Fábrica',
        address: process.env.SMTP_EMAIL_USER || 'noreply@arrozbemcasado.com.br',
      },
      to,
      subject: `Pedido #${orderId} - Bem Casado Alimentos - Pagamento PIX`,
      text: emailContent,
      attachments: [
        {
          filename: `qrcode-pedido-${orderId}.png`,
          path: qrCodePath,
          cid: `qrcode${orderId}`, // Content-ID para referência no HTML se necessário
        },
      ],
    };

    // Enviar email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('[Email] Email enviado com sucesso!');
    console.log('[Email] Para:', to);
    console.log('[Email] Message ID:', info.messageId);
    console.log('[Email] Response:', info.response);
  } catch (error) {
    console.error('[Email] Erro ao enviar email via Nodemailer:', error);
    throw error;
  } finally {
    // Limpar arquivo temporário
    try {
      await fs.unlink(qrCodePath);
    } catch (cleanupError) {
      console.warn('[Email] Erro ao limpar arquivo temporário:', cleanupError);
    }
  }
}
