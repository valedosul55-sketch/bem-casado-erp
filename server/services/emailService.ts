/**
 * EmailService - Serviço de envio de emails usando Nodemailer
 * 
 * Este serviço centraliza o envio de emails dos agentes do sistema,
 * usando Nodemailer com SMTP do Gmail.
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export enum EmailPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low'
}

export enum EmailType {
  DAILY_REPORT = 'daily_report',
  CRITICAL_ALERT = 'critical_alert',
  SYSTEM_NOTIFICATION = 'system_notification',
  TAX_LEGISLATION = 'tax_legislation',
  FINANCIAL_REPORT = 'financial_report',
  ACCOUNTING_REPORT = 'accounting_report',
  PRODUCTION_REPORT = 'production_report'
}

interface SendEmailOptions {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  html: string;
  priority?: EmailPriority;
  type?: EmailType;
  tags?: string[];
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: string | Buffer;
  }>;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class EmailService {
  
  private transporter: Transporter | null = null;
  
  /**
   * Cria transporter do Nodemailer
   */
  private createTransporter(): Transporter {
    if (this.transporter) {
      return this.transporter;
    }
    
    const emailUser = process.env.SMTP_EMAIL_USER || process.env.GMAIL_USER;
    const emailPass = process.env.SMTP_EMAIL_PASS || process.env.GMAIL_APP_PASSWORD;
    
    if (!emailUser || !emailPass) {
      throw new Error(
        'Credenciais SMTP não configuradas. ' +
        'Configure SMTP_EMAIL_USER e SMTP_EMAIL_PASS (ou GMAIL_USER e GMAIL_APP_PASSWORD) no .env'
      );
    }
    
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true para 465, false para outras portas
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
    
    return this.transporter;
  }
  
  /**
   * Envia email usando Nodemailer
   */
  async send(options: SendEmailOptions): Promise<EmailResult> {
    try {
      console.log(`[EMAIL] Enviando email: ${options.subject}`);
      console.log(`[EMAIL] Para: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
      
      const transporter = this.createTransporter();
      
      // Preparar destinatários
      const to = Array.isArray(options.to) ? options.to.join(', ') : options.to;
      const cc = options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : undefined;
      const bcc = options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc) : undefined;
      
      // Enviar email
      const info = await transporter.sendMail({
        from: {
          name: 'Sistema ERP Bem Casado',
          address: process.env.SMTP_EMAIL_USER || process.env.GMAIL_USER || 'noreply@arrozbemcasado.com.br',
        },
        to,
        cc,
        bcc,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments,
        priority: options.priority === EmailPriority.CRITICAL ? 'high' : 'normal',
      });
      
      console.log('[EMAIL] Email enviado com sucesso via Nodemailer');
      console.log('[EMAIL] Message ID:', info.messageId);
      
      return {
        success: true,
        messageId: info.messageId
      };
      
    } catch (error) {
      console.error('[EMAIL] Erro ao enviar email:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
  
  /**
   * Envia email de relatório diário
   */
  async sendDailyReport(options: {
    to: string;
    subject: string;
    html: string;
    cc?: string[];
  }): Promise<EmailResult> {
    return this.send({
      to: options.to,
      cc: options.cc,
      subject: options.subject,
      html: options.html,
      priority: EmailPriority.HIGH,
      type: EmailType.DAILY_REPORT,
      tags: ['daily-report', 'automated']
    });
  }
  
  /**
   * Envia alerta crítico
   */
  async sendCriticalAlert(options: {
    to: string;
    subject: string;
    html: string;
    cc?: string[];
  }): Promise<EmailResult> {
    return this.send({
      to: options.to,
      cc: options.cc,
      subject: `🔴 ALERTA CRÍTICO: ${options.subject}`,
      html: options.html,
      priority: EmailPriority.CRITICAL,
      type: EmailType.CRITICAL_ALERT,
      tags: ['alert', 'critical']
    });
  }
  
  /**
   * Envia notificação de sistema
   */
  async sendSystemNotification(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<EmailResult> {
    return this.send({
      to: options.to,
      subject: options.subject,
      html: options.html,
      priority: EmailPriority.NORMAL,
      type: EmailType.SYSTEM_NOTIFICATION,
      tags: ['system', 'notification']
    });
  }
  
  /**
   * Envia relatório de legislação fiscal
   */
  async sendTaxLegislationReport(options: {
    to: string;
    cc?: string[];
    html: string;
  }): Promise<EmailResult> {
    const date = new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return this.send({
      to: options.to,
      cc: options.cc,
      subject: `⚖️ Monitoramento Legislativo - ${date}`,
      html: options.html,
      priority: EmailPriority.HIGH,
      type: EmailType.TAX_LEGISLATION,
      tags: ['tax', 'legislation', 'daily-report']
    });
  }
  
  /**
   * Envia relatório consolidado diário
   */
  async sendConsolidatedDailyReport(options: {
    to: string;
    cc?: string[];
    html: string;
  }): Promise<EmailResult> {
    const date = new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return this.send({
      to: options.to,
      cc: options.cc,
      subject: `📊 Relatório Executivo Diário - ${date}`,
      html: options.html,
      priority: EmailPriority.HIGH,
      type: EmailType.DAILY_REPORT,
      tags: ['consolidated', 'daily-report', 'executive']
    });
  }
  
  /**
   * Envia relatório financeiro
   */
  async sendFinancialReport(options: {
    to: string;
    cc?: string[];
    subject: string;
    html: string;
  }): Promise<EmailResult> {
    return this.send({
      to: options.to,
      cc: options.cc,
      subject: `💰 ${options.subject}`,
      html: options.html,
      priority: EmailPriority.HIGH,
      type: EmailType.FINANCIAL_REPORT,
      tags: ['financial', 'report']
    });
  }
  
  /**
   * Envia relatório contábil
   */
  async sendAccountingReport(options: {
    to: string;
    cc?: string[];
    subject: string;
    html: string;
  }): Promise<EmailResult> {
    return this.send({
      to: options.to,
      cc: options.cc,
      subject: `💼 ${options.subject}`,
      html: options.html,
      priority: EmailPriority.HIGH,
      type: EmailType.ACCOUNTING_REPORT,
      tags: ['accounting', 'report']
    });
  }
  
  /**
   * Envia relatório de produção
   */
  async sendProductionReport(options: {
    to: string;
    cc?: string[];
    html: string;
  }): Promise<EmailResult> {
    const date = new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return this.send({
      to: options.to,
      cc: options.cc,
      subject: `🏭 Relatório de Produção - ${date}`,
      html: options.html,
      priority: EmailPriority.HIGH,
      type: EmailType.PRODUCTION_REPORT,
      tags: ['production', 'daily-report']
    });
  }
  
  /**
   * Verifica se as credenciais SMTP estão configuradas
   */
  isConfigured(): boolean {
    const emailUser = process.env.SMTP_EMAIL_USER || process.env.GMAIL_USER;
    const emailPass = process.env.SMTP_EMAIL_PASS || process.env.GMAIL_APP_PASSWORD;
    return !!(emailUser && emailPass);
  }
}

// Instância singleton
export const emailService = new EmailService();
