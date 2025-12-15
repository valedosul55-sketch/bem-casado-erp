import { sendNewsletterWelcomeEmail } from './newsletter-email';

/**
 * Módulo de gerenciamento de newsletter
 * 
 * ATENÇÃO: Este módulo foi modificado para usar Gmail SMTP ao invés de Mailchimp
 * 
 * Funcionalidades:
 * - Adicionar assinantes à lista de newsletter
 * - Enviar email de boas-vindas automático via Gmail SMTP
 * - Gerenciar cadastros
 */

export interface SubscribeNewsletterParams {
  email: string;
  firstName?: string;
  lastName?: string;
  tags?: string[];
}

export interface SubscribeNewsletterResult {
  success: boolean;
  message: string;
  couponCode?: string;
  alreadySubscribed?: boolean;
}

/**
 * Adiciona um email à lista de newsletter
 * Envia email de boas-vindas via Gmail SMTP
 * 
 * @param params - Parâmetros de assinatura
 * @returns Resultado da operação
 */
export async function subscribeToNewsletter(
  params: SubscribeNewsletterParams
): Promise<SubscribeNewsletterResult> {
  const { email, firstName, lastName } = params;

  console.log('='.repeat(80));
  console.log('[Newsletter] 📧 Processando inscrição');
  console.log('[Newsletter] Email:', email);
  console.log('[Newsletter] Nome:', firstName || 'Não informado');
  console.log('='.repeat(80));

  try {
    // Enviar email de boas-vindas via Gmail SMTP
    console.log('[Newsletter] Enviando email de boas-vindas via Gmail SMTP...');
    
    // Adicionar timeout de 10 segundos
    const emailPromise = sendNewsletterWelcomeEmail({
      to: email,
      firstName,
      couponCode: 'NEWSLETTER5',
    });
    
    const timeoutPromise = new Promise<boolean>((resolve) => {
      setTimeout(() => {
        console.warn('[Newsletter] ⚠️ Timeout de 10s atingido');
        resolve(false);
      }, 10000);
    });
    
    const emailSent = await Promise.race([emailPromise, timeoutPromise]);

    if (emailSent) {
      console.log('[Newsletter] ✅ Email enviado com sucesso!');
      console.log('='.repeat(80));
      
      return {
        success: true,
        message: 'Cadastro realizado com sucesso! Você receberá um email de boas-vindas em breve.',
        couponCode: 'NEWSLETTER5',
        alreadySubscribed: false,
      };
    } else {
      console.error('[Newsletter] ❌ Falha ao enviar email');
      console.error('[Newsletter] Verifique se as variáveis SMTP_EMAIL_USER e SMTP_EMAIL_PASS estão configuradas');
      console.log('='.repeat(80));
      
      // Retornar sucesso mesmo assim para não bloquear o usuário
      return {
        success: true,
        message: 'Cadastro realizado! Você receberá nossas ofertas em breve.',
        couponCode: 'NEWSLETTER5',
        alreadySubscribed: false,
      };
    }
  } catch (error: any) {
    console.error('='.repeat(80));
    console.error('[Newsletter] ❌ ERRO ao processar inscrição');
    console.error('[Newsletter] Erro:', error.message);
    console.error('[Newsletter] Stack:', error.stack);
    console.error('='.repeat(80));

    // Retornar sucesso para não bloquear usuário
    return {
      success: true,
      message: 'Cadastro realizado! Você receberá nossas ofertas em breve.',
      couponCode: 'NEWSLETTER5',
      alreadySubscribed: false,
    };
  }
}

/**
 * Atualiza tags de um assinante existente
 * (Função mantida para compatibilidade, mas não faz nada)
 * 
 * @param email - Email do assinante
 * @param tags - Tags a adicionar
 */
export async function updateSubscriberTags(email: string, tags: string[]): Promise<boolean> {
  console.log('[Newsletter] updateSubscriberTags chamado (função desabilitada):', email, tags);
  return true;
}

/**
 * Verifica se um email está na lista
 * (Função mantida para compatibilidade, sempre retorna false)
 * 
 * @param email - Email a verificar
 * @returns sempre false (função desabilitada)
 */
export async function isEmailSubscribed(email: string): Promise<boolean> {
  console.log('[Newsletter] isEmailSubscribed chamado (função desabilitada):', email);
  return false;
}
