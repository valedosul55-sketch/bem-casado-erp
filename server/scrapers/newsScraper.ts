/**
 * Scraper Genérico de Notícias Fiscais e Contábeis
 * 
 * Coleta notícias de fontes oficiais usando web scraping
 * e APIs públicas quando disponíveis.
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { NEWS_AGENT_CONFIG, type NewsPriority } from '../config/newsAgentConfig';

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: Date;
  category: string;
  priority: NewsPriority;
  keywords: string[];
  relevanceScore: number;
}

export class NewsScraper {
  private cache: Map<string, NewsItem[]> = new Map();
  
  /**
   * Busca notícias de todas as fontes configuradas
   */
  async fetchAllNews(): Promise<NewsItem[]> {
    const allNews: NewsItem[] = [];
    
    for (const [sourceKey, sourceConfig] of Object.entries(NEWS_AGENT_CONFIG.sources)) {
      if (!sourceConfig.enabled) continue;
      
      try {
        console.log(`[NewsScraper] Buscando notícias de ${sourceConfig.description}...`);
        
        const news = await this.fetchFromSource(sourceKey, sourceConfig);
        allNews.push(...news);
        
        console.log(`[NewsScraper] ${news.length} notícias encontradas em ${sourceConfig.description}`);
      } catch (error) {
        console.error(`[NewsScraper] Erro ao buscar notícias de ${sourceKey}:`, error);
      }
    }
    
    return allNews;
  }
  
  /**
   * Busca notícias de uma fonte específica
   */
  private async fetchFromSource(sourceKey: string, sourceConfig: any): Promise<NewsItem[]> {
    // Verificar cache
    const cached = this.cache.get(sourceKey);
    if (cached && this.isCacheValid(sourceKey)) {
      return cached;
    }
    
    let news: NewsItem[] = [];
    
    switch (sourceKey) {
      case 'dou':
        news = await this.scrapeDOU(sourceConfig);
        break;
      case 'rfb':
        news = await this.scrapeRFB(sourceConfig);
        break;
      case 'confaz':
        news = await this.scrapeCONFAZ(sourceConfig);
        break;
      case 'cfc':
        news = await this.scrapeCFC(sourceConfig);
        break;
      case 'mapa':
        news = await this.scrapeMAPA(sourceConfig);
        break;
      case 'conab':
        news = await this.scrapeCONAB(sourceConfig);
        break;
      default:
        news = await this.scrapeGeneric(sourceConfig);
    }
    
    // Atualizar cache
    this.cache.set(sourceKey, news);
    
    return news;
  }
  
  /**
   * Scraper do Diário Oficial da União (DOU)
   */
  private async scrapeDOU(config: any): Promise<NewsItem[]> {
    try {
      // Nota: DOU tem API oficial, mas vamos simular com scraping básico
      const response = await axios.get(config.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BemCasadoBot/1.0)'
        },
        timeout: 10000
      });
      
      const $ = cheerio.load(response.data);
      const news: NewsItem[] = [];
      
      // Buscar por palavras-chave críticas
      const keywords = NEWS_AGENT_CONFIG.keywords.critical;
      
      $('article, .item, .noticia').each((i, elem) => {
        const title = $(elem).find('h1, h2, h3, .title, .titulo').first().text().trim();
        const summary = $(elem).find('p, .summary, .resumo').first().text().trim();
        const link = $(elem).find('a').first().attr('href') || '';
        
        if (!title) return;
        
        // Verificar se contém palavras-chave relevantes
        const matchedKeywords = keywords.filter(kw => 
          title.toLowerCase().includes(kw.toLowerCase()) ||
          summary.toLowerCase().includes(kw.toLowerCase())
        );
        
        if (matchedKeywords.length > 0) {
          news.push({
            id: this.generateId(title, 'dou'),
            title,
            summary: summary.substring(0, 300),
            url: link.startsWith('http') ? link : `https://www.in.gov.br${link}`,
            source: 'Diário Oficial da União',
            publishedAt: new Date(),
            category: 'legislation',
            priority: 'critical',
            keywords: matchedKeywords,
            relevanceScore: this.calculateRelevance(matchedKeywords, 'critical')
          });
        }
      });
      
      return news.slice(0, 10); // Limitar a 10 notícias
    } catch (error) {
      console.error('[DOU Scraper] Erro:', error);
      return [];
    }
  }
  
  /**
   * Scraper da Receita Federal
   */
  private async scrapeRFB(config: any): Promise<NewsItem[]> {
    try {
      const response = await axios.get(config.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BemCasadoBot/1.0)'
        },
        timeout: 10000
      });
      
      const $ = cheerio.load(response.data);
      const news: NewsItem[] = [];
      
      $('.noticia, .item-noticia, article').each((i, elem) => {
        const title = $(elem).find('h2, h3, .titulo').first().text().trim();
        const summary = $(elem).find('p, .resumo').first().text().trim();
        const link = $(elem).find('a').first().attr('href') || '';
        const dateStr = $(elem).find('.data, time').first().text().trim();
        
        if (!title) return;
        
        const keywords = this.extractKeywords(title + ' ' + summary);
        
        if (keywords.length > 0) {
          news.push({
            id: this.generateId(title, 'rfb'),
            title,
            summary: summary.substring(0, 300),
            url: link.startsWith('http') ? link : `https://www.gov.br${link}`,
            source: 'Receita Federal',
            publishedAt: this.parseDate(dateStr),
            category: 'taxation',
            priority: 'high',
            keywords,
            relevanceScore: this.calculateRelevance(keywords, 'high')
          });
        }
      });
      
      return news.slice(0, 10);
    } catch (error) {
      console.error('[RFB Scraper] Erro:', error);
      return [];
    }
  }
  
  /**
   * Scraper do CONFAZ (ICMS)
   */
  private async scrapeCONFAZ(config: any): Promise<NewsItem[]> {
    try {
      const response = await axios.get(config.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BemCasadoBot/1.0)'
        },
        timeout: 10000
      });
      
      const $ = cheerio.load(response.data);
      const news: NewsItem[] = [];
      
      $('.noticia, article, .item').each((i, elem) => {
        const title = $(elem).find('h2, h3').first().text().trim();
        const summary = $(elem).find('p').first().text().trim();
        const link = $(elem).find('a').first().attr('href') || '';
        
        if (!title) return;
        
        // CONFAZ é sempre sobre ICMS, prioridade alta
        const keywords = this.extractKeywords(title + ' ' + summary);
        keywords.push('ICMS', 'CONFAZ');
        
        news.push({
          id: this.generateId(title, 'confaz'),
          title,
          summary: summary.substring(0, 300),
          url: link.startsWith('http') ? link : `https://www.confaz.fazenda.gov.br${link}`,
          source: 'CONFAZ',
          publishedAt: new Date(),
          category: 'taxation',
          priority: 'high',
          keywords,
          relevanceScore: this.calculateRelevance(keywords, 'high')
        });
      });
      
      return news.slice(0, 10);
    } catch (error) {
      console.error('[CONFAZ Scraper] Erro:', error);
      return [];
    }
  }
  
  /**
   * Scraper do CFC (Conselho Federal de Contabilidade)
   */
  private async scrapeCFC(config: any): Promise<NewsItem[]> {
    try {
      const response = await axios.get(config.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BemCasadoBot/1.0)'
        },
        timeout: 10000
      });
      
      const $ = cheerio.load(response.data);
      const news: NewsItem[] = [];
      
      $('.noticia, article').each((i, elem) => {
        const title = $(elem).find('h2, h3').first().text().trim();
        const summary = $(elem).find('p').first().text().trim();
        const link = $(elem).find('a').first().attr('href') || '';
        
        if (!title) return;
        
        const keywords = this.extractKeywords(title + ' ' + summary);
        
        if (keywords.length > 0) {
          news.push({
            id: this.generateId(title, 'cfc'),
            title,
            summary: summary.substring(0, 300),
            url: link.startsWith('http') ? link : `https://cfc.org.br${link}`,
            source: 'CFC',
            publishedAt: new Date(),
            category: 'accounting',
            priority: 'medium',
            keywords,
            relevanceScore: this.calculateRelevance(keywords, 'medium')
          });
        }
      });
      
      return news.slice(0, 10);
    } catch (error) {
      console.error('[CFC Scraper] Erro:', error);
      return [];
    }
  }
  
  /**
   * Scraper do MAPA (Ministério da Agricultura)
   */
  private async scrapeMAPA(config: any): Promise<NewsItem[]> {
    try {
      const response = await axios.get(config.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BemCasadoBot/1.0)'
        },
        timeout: 10000
      });
      
      const $ = cheerio.load(response.data);
      const news: NewsItem[] = [];
      
      $('.noticia, article').each((i, elem) => {
        const title = $(elem).find('h2, h3').first().text().trim();
        const summary = $(elem).find('p').first().text().trim();
        const link = $(elem).find('a').first().attr('href') || '';
        
        if (!title) return;
        
        const keywords = this.extractKeywords(title + ' ' + summary);
        
        if (keywords.length > 0) {
          news.push({
            id: this.generateId(title, 'mapa'),
            title,
            summary: summary.substring(0, 300),
            url: link.startsWith('http') ? link : `https://www.gov.br${link}`,
            source: 'MAPA',
            publishedAt: new Date(),
            category: 'agribusiness',
            priority: 'medium',
            keywords,
            relevanceScore: this.calculateRelevance(keywords, 'medium')
          });
        }
      });
      
      return news.slice(0, 10);
    } catch (error) {
      console.error('[MAPA Scraper] Erro:', error);
      return [];
    }
  }
  
  /**
   * Scraper da CONAB
   */
  private async scrapeCONAB(config: any): Promise<NewsItem[]> {
    try {
      const response = await axios.get(config.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BemCasadoBot/1.0)'
        },
        timeout: 10000
      });
      
      const $ = cheerio.load(response.data);
      const news: NewsItem[] = [];
      
      $('.noticia, article').each((i, elem) => {
        const title = $(elem).find('h2, h3').first().text().trim();
        const summary = $(elem).find('p').first().text().trim();
        const link = $(elem).find('a').first().attr('href') || '';
        
        if (!title) return;
        
        // CONAB: foco em arroz, feijão, preços
        if (title.toLowerCase().includes('arroz') || 
            title.toLowerCase().includes('feijão') ||
            title.toLowerCase().includes('preço')) {
          
          const keywords = this.extractKeywords(title + ' ' + summary);
          
          news.push({
            id: this.generateId(title, 'conab'),
            title,
            summary: summary.substring(0, 300),
            url: link.startsWith('http') ? link : `https://www.conab.gov.br${link}`,
            source: 'CONAB',
            publishedAt: new Date(),
            category: 'market',
            priority: 'low',
            keywords,
            relevanceScore: this.calculateRelevance(keywords, 'low')
          });
        }
      });
      
      return news.slice(0, 10);
    } catch (error) {
      console.error('[CONAB Scraper] Erro:', error);
      return [];
    }
  }
  
  /**
   * Scraper genérico (fallback)
   */
  private async scrapeGeneric(config: any): Promise<NewsItem[]> {
    try {
      const response = await axios.get(config.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BemCasadoBot/1.0)'
        },
        timeout: 10000
      });
      
      const $ = cheerio.load(response.data);
      const news: NewsItem[] = [];
      
      $('article, .noticia, .item').each((i, elem) => {
        const title = $(elem).find('h1, h2, h3').first().text().trim();
        const summary = $(elem).find('p').first().text().trim();
        const link = $(elem).find('a').first().attr('href') || '';
        
        if (!title) return;
        
        const keywords = this.extractKeywords(title + ' ' + summary);
        
        if (keywords.length > 0) {
          news.push({
            id: this.generateId(title, 'generic'),
            title,
            summary: summary.substring(0, 300),
            url: link,
            source: config.description,
            publishedAt: new Date(),
            category: 'agribusiness',
            priority: 'low',
            keywords,
            relevanceScore: this.calculateRelevance(keywords, 'low')
          });
        }
      });
      
      return news.slice(0, 10);
    } catch (error) {
      console.error('[Generic Scraper] Erro:', error);
      return [];
    }
  }
  
  /**
   * Extrai palavras-chave do texto
   */
  private extractKeywords(text: string): string[] {
    const allKeywords = [
      ...NEWS_AGENT_CONFIG.keywords.critical,
      ...NEWS_AGENT_CONFIG.keywords.high,
      ...NEWS_AGENT_CONFIG.keywords.medium,
      ...NEWS_AGENT_CONFIG.keywords.low
    ];
    
    const found: string[] = [];
    const lowerText = text.toLowerCase();
    
    for (const keyword of allKeywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        found.push(keyword);
      }
    }
    
    return Array.from(new Set(found)); // Remove duplicatas
  }
  
  /**
   * Calcula score de relevância
   */
  private calculateRelevance(keywords: string[], priority: NewsPriority): number {
    const priorityScores = {
      critical: 1.0,
      high: 0.7,
      medium: 0.5,
      low: 0.3
    };
    
    const baseScore = priorityScores[priority];
    const keywordBonus = Math.min(keywords.length * 0.1, 0.3);
    
    return Math.min(baseScore + keywordBonus, 1.0);
  }
  
  /**
   * Gera ID único para a notícia
   */
  private generateId(title: string, source: string): string {
    const hash = title.substring(0, 50).replace(/[^a-z0-9]/gi, '').toLowerCase();
    const timestamp = Date.now();
    return `${source}-${hash}-${timestamp}`;
  }
  
  /**
   * Parse de data (formato brasileiro)
   */
  private parseDate(dateStr: string): Date {
    // Tentar formatos comuns: dd/mm/yyyy, dd-mm-yyyy, etc
    const patterns = [
      /(\d{2})\/(\d{2})\/(\d{4})/,
      /(\d{2})-(\d{2})-(\d{4})/
    ];
    
    for (const pattern of patterns) {
      const match = dateStr.match(pattern);
      if (match) {
        const [, day, month, year] = match;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
    }
    
    return new Date(); // Fallback: hoje
  }
  
  /**
   * Verifica se cache ainda é válido
   */
  private isCacheValid(sourceKey: string): boolean {
    // Cache válido por 24h
    return false; // Por enquanto, sempre buscar notícias frescas
  }
}
