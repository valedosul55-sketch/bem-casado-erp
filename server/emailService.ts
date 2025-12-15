import { Resend } from "resend";
import type { MonitorUpdate } from "../drizzle/schema";

// Inicializar Resend apenas se a API key estiver configurada
let resend: Resend | null = null;

if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  console.warn("RESEND_API_KEY not configured. Email functionality will be disabled.");
}

const FROM_EMAIL = "onboarding@resend.dev"; // Usando domínio padrão do Resend para testes
const TO_EMAIL = process.env.OWNER_EMAIL || "contato@bemcasado.com";

/**
 * Envia email genérico
 */
export async function sendEmail(options: {
  to: string;
  cc?: string;
  subject: string;
  html: string;
}) {
  if (!resend) {
    console.warn("Resend not configured, skipping email");
    return;
  }

  try {
    const emailOptions: any = {
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    if (options.cc) {
      emailOptions.cc = options.cc;
    }

    const result = await resend.emails.send(emailOptions);
    console.log("Email sent:", result);
    return result;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

/**
 * Envia digest diário com atualizações
 */
export async function sendDailyDigest(updates: MonitorUpdate[]) {
  if (!resend) {
    console.warn("Resend not configured, skipping email");
    return;
  }

  // Agrupar por categoria
  const byCategory = groupByCategory(updates);

  // Gerar HTML do email
  const html = generateDigestHTML(byCategory);

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject: `📰 Atualizações Diárias - ${new Date().toLocaleDateString("pt-BR")}`,
      html,
    });

    console.log("Daily digest email sent:", result);
    return result;
  } catch (error) {
    console.error("Error sending daily digest:", error);
    throw error;
  }
}

/**
 * Envia alerta de atualização crítica
 */
export async function sendCriticalAlert(update: MonitorUpdate) {
  if (!resend) {
    console.warn("Resend not configured, skipping email");
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        .title { color: #856404; font-size: 20px; font-weight: bold; margin-bottom: 10px; }
        .content { margin: 15px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="alert">
          <div class="title">⚠️ Atualização Crítica Detectada</div>
        </div>
        
        <h2>${update.title}</h2>
        
        <div class="content">
          <strong>Resumo:</strong><br>
          ${update.summary || "Sem resumo disponível"}
        </div>
        
        <div class="content">
          <strong>Conteúdo:</strong><br>
          ${update.content.substring(0, 500)}...
        </div>
        
        ${update.url ? `<p><a href="${update.url}">Ver notícia completa</a></p>` : ""}
        
        <div class="footer">
          <p>Sistema de Monitoramento Automático - Bem Casado</p>
          <p>Score de relevância: ${update.relevanceScore}/100</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject: `🚨 ALERTA: ${update.title}`,
      html,
    });

    console.log("Critical alert email sent:", result);
    return result;
  } catch (error) {
    console.error("Error sending critical alert:", error);
    throw error;
  }
}

/**
 * Agrupa atualizações por categoria
 */
function groupByCategory(updates: MonitorUpdate[]): Map<number, MonitorUpdate[]> {
  const grouped = new Map<number, MonitorUpdate[]>();

  for (const update of updates) {
    const existing = grouped.get(update.categoryId) || [];
    existing.push(update);
    grouped.set(update.categoryId, existing);
  }

  return grouped;
}

/**
 * Gera HTML do digest diário
 */
function generateDigestHTML(byCategory: Map<number, MonitorUpdate[]>): string {
  const categoryNames: Record<number, string> = {
    1: "📊 Fiscal",
    2: "💰 Contábil",
    3: "🌾 Agronegócio",
  };

  let sectionsHTML = "";

  for (const [categoryId, updates] of Array.from(byCategory.entries())) {
    const categoryName = categoryNames[categoryId] || `Categoria ${categoryId}`;
    const relevantUpdates = updates.filter((u) => u.isRelevant === 1);

    if (relevantUpdates.length === 0) continue;

    sectionsHTML += `
      <div class="category">
        <h2>${categoryName}</h2>
        <div class="updates">
    `;

    for (const update of relevantUpdates.slice(0, 10)) {
      // Máximo 10 por categoria
      sectionsHTML += `
        <div class="update">
          <h3>${update.title}</h3>
          <p class="summary">${update.summary || update.content.substring(0, 200) + "..."}</p>
          ${update.url ? `<a href="${update.url}" class="read-more">Ler mais →</a>` : ""}
          <div class="meta">
            Score: ${update.relevanceScore}/100 | 
            ${update.publishedAt ? new Date(update.publishedAt).toLocaleDateString("pt-BR") : "Data não disponível"}
          </div>
        </div>
      `;
    }

    sectionsHTML += `
        </div>
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; background: white; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .category { margin: 30px 0; }
        .category h2 { color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
        .update { background: #f9f9f9; padding: 20px; margin: 15px 0; border-left: 4px solid #667eea; border-radius: 4px; }
        .update h3 { margin-top: 0; color: #333; }
        .summary { color: #666; margin: 10px 0; }
        .read-more { color: #667eea; text-decoration: none; font-weight: bold; }
        .read-more:hover { text-decoration: underline; }
        .meta { font-size: 12px; color: #999; margin-top: 10px; }
        .footer { margin-top: 40px; padding: 20px; background: #f5f5f5; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📰 Atualizações Diárias</h1>
          <p>${new Date().toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
        
        ${sectionsHTML}
        
        <div class="footer">
          <p><strong>Sistema de Monitoramento Automático</strong></p>
          <p>Loja de Fábrica Bem Casado</p>
          <p>Este email é enviado automaticamente todos os dias às 8h</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
