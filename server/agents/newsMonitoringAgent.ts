/**
 * Agente de Monitoramento de Notícias Fiscais e Contábeis
 * 
 * Monitora diariamente fontes oficiais (DOU, RFB, SEFAZ, CFC, MAPA)
 * em busca de mudanças legislativas, normativas e notícias relevantes
 * para o agronegócio.
 * 
 * Envia email diário às 08:00 com resumo executivo.
 */

import { NewsScraper, type NewsItem } from '../scrapers/newsScraper';
import { NEWS_AGENT_CONFIG, type NewsCategory, type NewsPriority } from '../config/newsAgentConfig';
import { sendEmail } from '../emailService';

interface CategorizedNews {
  [category: string]: NewsItem[];
}

export class NewsMonitoringAgent {
  private scraper: NewsScraper;
  
  constructor() {
    this.scraper = new NewsScraper();
  }
  
  /**
   * Executa monitoramento completo e envia relatório
   */
  async monitorAndSendReport(): Promise<void> {
    console.log('[NewsAgent] Iniciando monitoramento de notícias fiscais e contábeis...');
    
    try {
      // 1. Buscar notícias de todas as fontes
      const allNews = await this.scraper.fetchAllNews();
      console.log(`[NewsAgent] ${allNews.length} notícias coletadas`);
      
      // 2. Filtrar e classificar
      const filteredNews = this.filterNews(allNews);
      console.log(`[NewsAgent] ${filteredNews.length} notícias relevantes após filtragem`);
      
      // 3. Categorizar
      const categorizedNews = this.categorizeNews(filteredNews);
      
      // 4. Ordenar por prioridade
      const sortedNews = this.sortByPriority(categorizedNews);
      
      // 5. Gerar e enviar email (SEMPRE envia, mesmo sem notícias)
      await this.sendDailyReport(sortedNews, allNews.length);
      console.log('[NewsAgent] Relatório enviado com sucesso');
      
    } catch (error) {
      console.error('[NewsAgent] Erro ao monitorar notícias:', error);
      await this.notifyError(error);
    }
  }
  
  /**
   * Filtra notícias por relevância
   */
  private filterNews(news: NewsItem[]): NewsItem[] {
    return news
      .filter(item => item.relevanceScore >= NEWS_AGENT_CONFIG.limits.minRelevanceScore)
      .filter(item => item.keywords.length > 0)
      .slice(0, NEWS_AGENT_CONFIG.limits.maxTotalNews);
  }
  
  /**
   * Categoriza notícias
   */
  private categorizeNews(news: NewsItem[]): CategorizedNews {
    const categorized: CategorizedNews = {};
    
    for (const item of news) {
      const category = item.category || 'agribusiness';
      
      if (!categorized[category]) {
        categorized[category] = [];
      }
      
      if (categorized[category].length < NEWS_AGENT_CONFIG.limits.maxNewsPerCategory) {
        categorized[category].push(item);
      }
    }
    
    return categorized;
  }
  
  /**
   * Ordena categorias por prioridade
   */
  private sortByPriority(categorized: CategorizedNews): CategorizedNews {
    const sorted: CategorizedNews = {};
    
    // Ordem de prioridade das categorias
    const categoryOrder: NewsCategory[] = [
      'legislation',
      'compliance',
      'taxation',
      'accounting',
      'agribusiness',
      'market'
    ];
    
    for (const category of categoryOrder) {
      if (categorized[category] && categorized[category].length > 0) {
        // Ordenar notícias dentro da categoria por relevância
        sorted[category] = categorized[category].sort((a, b) => 
          b.relevanceScore - a.relevanceScore
        );
      }
    }
    
    return sorted;
  }
  
  /**
   * Envia relatório diário por email
   */
  private async sendDailyReport(news: CategorizedNews, totalScraped: number = 0): Promise<void> {
    const html = this.generateEmailHTML(news, totalScraped);
    
    await sendEmail({
      to: NEWS_AGENT_CONFIG.recipients.to,
      cc: NEWS_AGENT_CONFIG.recipients.cc.join(', '),
      subject: `📰 Monitoramento Fiscal e Contábil - ${new Date().toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`,
      html
    });
  }
  
  /**
   * Gera HTML do email
   */
  private generateEmailHTML(news: CategorizedNews, totalScraped: number = 0): string {
    const totalNews = Object.values(news).reduce((sum, items) => sum + items.length, 0);
    const criticalCount = this.countByPriority(news, 'critical');
    const highCount = this.countByPriority(news, 'high');
    const hasNews = totalNews > 0;
    
    let html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      border-bottom: 3px solid #E63946;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0;
      color: #E63946;
      font-size: 24px;
    }
    .summary {
      background: #f8f9fa;
      border-left: 4px solid #E63946;
      padding: 15px;
      margin-bottom: 30px;
    }
    .summary-stats {
      display: flex;
      gap: 20px;
      margin-top: 10px;
    }
    .stat {
      flex: 1;
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #E63946;
    }
    .stat-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
    }
    .category {
      margin-bottom: 30px;
    }
    .category-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #eee;
    }
    .category-icon {
      font-size: 24px;
    }
    .category-title {
      font-size: 18px;
      font-weight: bold;
      color: #333;
      margin: 0;
    }
    .news-item {
      background: #fafafa;
      border-left: 4px solid #ddd;
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 4px;
    }
    .news-item.critical {
      border-left-color: #dc3545;
      background: #fff5f5;
    }
    .news-item.high {
      border-left-color: #fd7e14;
      background: #fff8f0;
    }
    .news-item.medium {
      border-left-color: #ffc107;
    }
    .news-title {
      font-size: 16px;
      font-weight: bold;
      color: #333;
      margin: 0 0 8px 0;
    }
    .news-meta {
      font-size: 12px;
      color: #666;
      margin-bottom: 8px;
    }
    .news-summary {
      font-size: 14px;
      color: #555;
      margin-bottom: 10px;
    }
    .news-keywords {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      margin-bottom: 10px;
    }
    .keyword {
      background: #e9ecef;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      color: #495057;
    }
    .news-link {
      color: #E63946;
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
    }
    .news-link:hover {
      text-decoration: underline;
    }
    .priority-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 3px;
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
    }
    .priority-critical {
      background: #dc3545;
      color: white;
    }
    .priority-high {
      background: #fd7e14;
      color: white;
    }
    .priority-medium {
      background: #ffc107;
      color: #333;
    }
    .priority-low {
      background: #6c757d;
      color: white;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #eee;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📰 Monitoramento Fiscal e Contábil</h1>
      <p style="margin: 5px 0 0 0; color: #666;">
        ${new Date().toLocaleDateString('pt-BR', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </p>
    </div>
    
    <div class="summary">
      <h3 style="margin-top: 0;">📊 Resumo Executivo</h3>
      <div class="summary-stats">
        <div class="stat">
          <div class="stat-value">${totalNews}</div>
          <div class="stat-label">Notícias Relevantes</div>
        </div>
        <div class="stat">
          <div class="stat-value">${criticalCount}</div>
          <div class="stat-label">Críticas</div>
        </div>
        <div class="stat">
          <div class="stat-value">${highCount}</div>
          <div class="stat-label">Alta Prioridade</div>
        </div>
      </div>
    </div>
`;
    
    // Se não houver notícias, mostrar mensagem informativa
    if (!hasNews) {
      html += `
    <div style="background: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 8px; padding: 30px; margin: 20px 0; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 15px;">✅</div>
      <h2 style="color: #0369a1; margin: 0 0 10px 0;">Nenhuma Notícia Relevante Hoje</h2>
      <p style="color: #0c4a6e; margin: 0;">
        O monitoramento foi executado com sucesso, mas não foram encontradas notícias 
        relevantes para o agronegócio nas fontes oficiais hoje.
      </p>
      <p style="color: #64748b; font-size: 14px; margin-top: 15px;">
        Total de itens verificados: ${totalScraped}
      </p>
    </div>
`;
    } else {
      // Adicionar notícias por categoria
      for (const [category, items] of Object.entries(news)) {
        const categoryConfig = NEWS_AGENT_CONFIG.categories[category as NewsCategory];
        if (!categoryConfig) continue;
        
        html += `
    <div class="category">
      <div class="category-header">
        <span class="category-icon">${categoryConfig.icon}</span>
        <h2 class="category-title">${categoryConfig.name}</h2>
      </div>
`;
        
        for (const item of items) {
          html += `
      <div class="news-item ${item.priority}">
        <div class="news-meta">
          <span class="priority-badge priority-${item.priority}">${item.priority}</span>
          <span style="margin-left: 10px;">${item.source}</span>
          <span style="margin-left: 10px;">${item.publishedAt.toLocaleDateString('pt-BR')}</span>
        </div>
        <h3 class="news-title">${item.title}</h3>
        ${item.summary ? `<p class="news-summary">${item.summary}</p>` : ''}
        <div class="news-keywords">
          ${item.keywords.slice(0, 5).map(kw => `<span class="keyword">${kw}</span>`).join('')}
        </div>
        <a href="${item.url}" class="news-link" target="_blank">Ler notícia completa →</a>
      </div>
`;
        }
        
        html += `
    </div>
`;
      }
    }
    
    html += `
    <div class="footer">
      <p><strong>Sistema de Monitoramento Automático</strong></p>
      <p>Bem Casado Alimentos - ERP Industrial</p>
      <p>Este email é enviado automaticamente todos os dias úteis às 08:00</p>
      <p style="margin-top: 15px; font-size: 11px;">
        Fontes monitoradas: DOU, Receita Federal, CONFAZ, CFC, MAPA, CONAB
      </p>
    </div>
  </div>
</body>
</html>
`;
    
    return html;
  }
  
  /**
   * Conta notícias por prioridade
   */
  private countByPriority(news: CategorizedNews, priority: NewsPriority): number {
    let count = 0;
    for (const items of Object.values(news)) {
      count += items.filter(item => item.priority === priority).length;
    }
    return count;
  }
  
  /**
   * Notifica erro por email
   */
  private async notifyError(error: any): Promise<void> {
    try {
      await sendEmail({
        to: NEWS_AGENT_CONFIG.recipients.to,
        subject: '⚠️ Erro no Agente de Monitoramento de Notícias',
        html: `
          <h2>⚠️ Erro no Agente de Monitoramento</h2>
          <p>Ocorreu um erro ao executar o monitoramento de notícias fiscais e contábeis:</p>
          <pre>${error.message || error}</pre>
          <p><small>Data/Hora: ${new Date().toLocaleString('pt-BR')}</small></p>
        `
      });
    } catch (emailError) {
      console.error('[NewsAgent] Erro ao enviar notificação de erro:', emailError);
    }
  }
}
