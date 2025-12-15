/**
 * Email Templates - Templates HTML para emails dos agentes
 * 
 * Templates profissionais e responsivos para todos os tipos de emails
 * enviados pelos agentes do sistema.
 */

export interface TaxLegislationReportData {
  date: string;
  criticalAlerts: Array<{
    title: string;
    source: string;
    publishedAt: string;
    deadline?: string;
    description: string;
    impact: string;
    action: string;
    link?: string;
  }>;
  douPublications: Array<{
    title: string;
    publishedAt: string;
    summary: string;
    impact: string;
    action: string;
    link?: string;
  }>;
  opportunities: Array<{
    title: string;
    description: string;
    savings: string;
  }>;
  obligationsNext30Days: Array<{
    obligation: string;
    period: string;
    deadline: string;
    status: 'pending' | 'ok';
  }>;
}

export interface ConsolidatedReportData {
  date: string;
  sales: {
    today: number;
    yesterday: number;
    change: number;
  };
  inventory: {
    lowStock: number;
    outOfStock: number;
  };
  financial: {
    cashBalance: number;
    accountsReceivable: number;
    accountsPayable: number;
  };
  production: {
    produced: number;
    target: number;
    efficiency: number;
  };
  highlights: string[];
  alerts: string[];
}

export class EmailTemplates {
  
  /**
   * Template base para todos os emails
   */
  private static baseTemplate(content: string): string {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem Casado - Sistema ERP</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 800px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #c92a2a 0%, #862e9c 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .header p {
      margin: 10px 0 0 0;
      opacity: 0.9;
      font-size: 14px;
    }
    .content {
      padding: 30px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #c92a2a;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #c92a2a;
    }
    .alert-critical {
      background: #ffe3e3;
      border-left: 5px solid #c92a2a;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }
    .alert-high {
      background: #fff3bf;
      border-left: 5px solid #f08c00;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }
    .alert-medium {
      background: #e3f2fd;
      border-left: 5px solid #1971c2;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }
    .alert-title {
      font-weight: 600;
      font-size: 16px;
      margin-bottom: 10px;
    }
    .alert-meta {
      font-size: 13px;
      color: #666;
      margin-bottom: 10px;
    }
    .alert-description {
      margin: 10px 0;
    }
    .alert-impact {
      background: rgba(0,0,0,0.05);
      padding: 10px;
      margin: 10px 0;
      border-radius: 4px;
    }
    .alert-action {
      background: #d3f9d8;
      padding: 10px;
      margin: 10px 0;
      border-radius: 4px;
      font-weight: 500;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    .table th {
      background-color: #862e9c;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }
    .table td {
      border: 1px solid #ddd;
      padding: 12px;
    }
    .table tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .status-pending {
      color: #f08c00;
      font-weight: 600;
    }
    .status-ok {
      color: #2b8a3e;
      font-weight: 600;
    }
    .footer {
      background-color: #f5f5f5;
      padding: 20px 30px;
      text-align: center;
      font-size: 13px;
      color: #666;
    }
    .footer a {
      color: #c92a2a;
      text-decoration: none;
    }
    .metric-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin: 15px 0;
      text-align: center;
    }
    .metric-value {
      font-size: 32px;
      font-weight: 700;
      color: #c92a2a;
      margin: 10px 0;
    }
    .metric-label {
      font-size: 14px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .metric-change {
      font-size: 14px;
      margin-top: 5px;
    }
    .metric-change.positive {
      color: #2b8a3e;
    }
    .metric-change.negative {
      color: #c92a2a;
    }
    .highlight {
      background: #fff3bf;
      padding: 10px 15px;
      margin: 10px 0;
      border-radius: 4px;
      border-left: 4px solid #f08c00;
    }
    @media only screen and (max-width: 600px) {
      .container {
        margin: 0;
        border-radius: 0;
      }
      .content {
        padding: 20px;
      }
      .metric-card {
        padding: 15px;
      }
    }
  </style>
</head>
<body>
  ${content}
</body>
</html>
    `;
  }
  
  /**
   * Template de relatório de legislação fiscal
   */
  static taxLegislationReport(data: TaxLegislationReportData): string {
    const criticalAlertsHtml = data.criticalAlerts.map(alert => `
      <div class="alert-critical">
        <div class="alert-title">⚠️ ${alert.title}</div>
        <div class="alert-meta">
          📅 Publicação: ${alert.source} | ${alert.publishedAt}
          ${alert.deadline ? `<br/>⏰ Prazo: <span style="color: #c92a2a; font-weight: bold;">${alert.deadline}</span>` : ''}
        </div>
        <div class="alert-description">${alert.description}</div>
        <div class="alert-impact">
          <strong>💡 Impacto:</strong> ${alert.impact}
        </div>
        <div class="alert-action">
          <strong>✅ Ação Obrigatória:</strong> ${alert.action}
        </div>
        ${alert.link ? `<p><a href="${alert.link}" style="color: #c92a2a;">🔗 Ver publicação oficial</a></p>` : ''}
      </div>
    `).join('');
    
    const douPublicationsHtml = data.douPublications.map(pub => `
      <div class="alert-high">
        <div class="alert-title">${pub.title}</div>
        <div class="alert-meta">📅 Publicação: ${pub.publishedAt}</div>
        <div class="alert-description">${pub.summary}</div>
        <div class="alert-impact">
          <strong>💡 Impacto:</strong> ${pub.impact}
        </div>
        <div class="alert-action">
          <strong>✅ Ação:</strong> ${pub.action}
        </div>
        ${pub.link ? `<p><a href="${pub.link}" style="color: #f08c00;">🔗 Ver no DOU</a></p>` : ''}
      </div>
    `).join('');
    
    const opportunitiesHtml = data.opportunities.map(opp => `
      <div class="highlight">
        <strong>${opp.title}</strong><br/>
        ${opp.description}<br/>
        <span style="color: #2b8a3e; font-weight: 600;">💰 Economia estimada: ${opp.savings}</span>
      </div>
    `).join('');
    
    const obligationsHtml = `
      <table class="table">
        <thead>
          <tr>
            <th>Obrigação</th>
            <th>Período</th>
            <th>Prazo</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${data.obligationsNext30Days.map(obl => `
            <tr>
              <td>${obl.obligation}</td>
              <td>${obl.period}</td>
              <td>${obl.deadline}</td>
              <td class="status-${obl.status}">${obl.status === 'pending' ? '⚠️ Pendente' : '🟢 No prazo'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    const content = `
      <div class="container">
        <div class="header">
          <h1>⚖️ Monitoramento Legislativo - Fiscal e Contábil</h1>
          <p>${data.date}</p>
        </div>
        <div class="content">
          
          ${data.criticalAlerts.length > 0 ? `
            <div class="section">
              <div class="section-title">🔴 ALERTAS CRÍTICOS - AÇÃO IMEDIATA</div>
              ${criticalAlertsHtml}
            </div>
          ` : ''}
          
          ${data.douPublications.length > 0 ? `
            <div class="section">
              <div class="section-title">📜 DIÁRIO OFICIAL DA UNIÃO - ÚLTIMAS 24 HORAS</div>
              ${douPublicationsHtml}
            </div>
          ` : ''}
          
          ${data.opportunities.length > 0 ? `
            <div class="section">
              <div class="section-title">💰 OPORTUNIDADES IDENTIFICADAS</div>
              ${opportunitiesHtml}
            </div>
          ` : ''}
          
          ${data.obligationsNext30Days.length > 0 ? `
            <div class="section">
              <div class="section-title">📋 OBRIGAÇÕES ACESSÓRIAS - PRÓXIMOS 30 DIAS</div>
              ${obligationsHtml}
            </div>
          ` : ''}
          
        </div>
        <div class="footer">
          <p>⚖️ Este relatório foi gerado automaticamente pelo Agente de Legislação Fiscal e Contábil.</p>
          <p>🤖 Sistema: ERP Bem Casado | ⏰ Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
          <p>📧 Dúvidas: <a href="mailto:fiscal@arrozbemcasado.com.br">fiscal@arrozbemcasado.com.br</a></p>
        </div>
      </div>
    `;
    
    return this.baseTemplate(content);
  }
  
  /**
   * Template de relatório consolidado diário
   */
  static consolidatedDailyReport(data: ConsolidatedReportData): string {
    const salesChange = data.sales.change >= 0 ? 'positive' : 'negative';
    const salesIcon = data.sales.change >= 0 ? '📈' : '📉';
    
    const highlightsHtml = data.highlights.map(h => `
      <div class="highlight">✨ ${h}</div>
    `).join('');
    
    const alertsHtml = data.alerts.map(a => `
      <div class="alert-high">⚠️ ${a}</div>
    `).join('');
    
    const content = `
      <div class="container">
        <div class="header">
          <h1>📊 Relatório Executivo Diário</h1>
          <p>${data.date}</p>
        </div>
        <div class="content">
          
          <div class="section">
            <div class="section-title">💰 VENDAS</div>
            <div class="metric-card">
              <div class="metric-label">Vendas Hoje</div>
              <div class="metric-value">R$ ${data.sales.today.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <div class="metric-change ${salesChange}">
                ${salesIcon} ${data.sales.change >= 0 ? '+' : ''}${data.sales.change.toFixed(1)}% vs ontem
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">📦 ESTOQUE</div>
            <table class="table">
              <tr>
                <td><strong>Produtos com estoque baixo</strong></td>
                <td class="status-${data.inventory.lowStock > 0 ? 'pending' : 'ok'}">${data.inventory.lowStock}</td>
              </tr>
              <tr>
                <td><strong>Produtos sem estoque</strong></td>
                <td class="status-${data.inventory.outOfStock > 0 ? 'pending' : 'ok'}">${data.inventory.outOfStock}</td>
              </tr>
            </table>
          </div>
          
          <div class="section">
            <div class="section-title">💼 FINANCEIRO</div>
            <table class="table">
              <tr>
                <td><strong>Saldo em caixa</strong></td>
                <td>R$ ${data.financial.cashBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td><strong>Contas a receber</strong></td>
                <td>R$ ${data.financial.accountsReceivable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td><strong>Contas a pagar</strong></td>
                <td>R$ ${data.financial.accountsPayable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>
            </table>
          </div>
          
          <div class="section">
            <div class="section-title">🏭 PRODUÇÃO</div>
            <div class="metric-card">
              <div class="metric-label">Produção Hoje</div>
              <div class="metric-value">${data.production.produced} kg</div>
              <div class="metric-change ${data.production.efficiency >= 100 ? 'positive' : 'negative'}">
                Meta: ${data.production.target} kg | Eficiência: ${data.production.efficiency.toFixed(1)}%
              </div>
            </div>
          </div>
          
          ${data.highlights.length > 0 ? `
            <div class="section">
              <div class="section-title">✨ DESTAQUES DO DIA</div>
              ${highlightsHtml}
            </div>
          ` : ''}
          
          ${data.alerts.length > 0 ? `
            <div class="section">
              <div class="section-title">⚠️ ALERTAS</div>
              ${alertsHtml}
            </div>
          ` : ''}
          
        </div>
        <div class="footer">
          <p>📊 Este relatório foi gerado automaticamente pelo Agente de Relatórios Diários.</p>
          <p>🤖 Sistema: ERP Bem Casado | ⏰ Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
          <p>📧 Dúvidas: <a href="mailto:diretoria@arrozbemcasado.com.br">diretoria@arrozbemcasado.com.br</a></p>
        </div>
      </div>
    `;
    
    return this.baseTemplate(content);
  }
  
  /**
   * Template de alerta crítico
   */
  static criticalAlert(options: {
    title: string;
    description: string;
    impact: string;
    action: string;
    deadline?: string;
  }): string {
    const content = `
      <div class="container">
        <div class="header" style="background: linear-gradient(135deg, #c92a2a 0%, #a61e4d 100%);">
          <h1>🔴 ALERTA CRÍTICO</h1>
          <p>Ação imediata necessária</p>
        </div>
        <div class="content">
          
          <div class="alert-critical">
            <div class="alert-title">${options.title}</div>
            ${options.deadline ? `
              <div class="alert-meta">
                ⏰ Prazo: <span style="color: #c92a2a; font-weight: bold; font-size: 16px;">${options.deadline}</span>
              </div>
            ` : ''}
            <div class="alert-description">${options.description}</div>
            <div class="alert-impact">
              <strong>💡 Impacto:</strong> ${options.impact}
            </div>
            <div class="alert-action">
              <strong>✅ Ação Obrigatória:</strong> ${options.action}
            </div>
          </div>
          
        </div>
        <div class="footer">
          <p>🔴 Este é um alerta crítico gerado automaticamente pelo sistema.</p>
          <p>🤖 Sistema: ERP Bem Casado | ⏰ Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
        </div>
      </div>
    `;
    
    return this.baseTemplate(content);
  }
}
