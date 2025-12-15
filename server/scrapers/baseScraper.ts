import axios from "axios";
import * as cheerio from "cheerio";
import Parser from "rss-parser";

export interface ScrapedItem {
  title: string;
  content: string;
  url?: string;
  publishedAt?: Date;
}

export interface ScraperConfig {
  type: "scraper" | "rss" | "api";
  selectors?: {
    container?: string;
    title?: string;
    content?: string;
    url?: string;
    date?: string;
  };
  rssUrl?: string;
}

/**
 * Base class para scrapers
 */
export class BaseScraper {
  protected config: ScraperConfig;
  protected rssParser: Parser;

  constructor(config: ScraperConfig) {
    this.config = config;
    this.rssParser = new Parser({
      timeout: 30000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
  }

  /**
   * Faz requisição HTTP com retry
   */
  protected async fetchPage(url: string, retries = 3): Promise<string> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios.get(url, {
          timeout: 30000,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
          },
        });
        return response.data;
      } catch (error) {
        if (i === retries - 1) throw error;
        await this.sleep(2000 * (i + 1)); // Exponential backoff
      }
    }
    throw new Error("Failed to fetch page after retries");
  }

  /**
   * Scraping via HTML parsing
   */
  protected async scrapeHTML(url: string): Promise<ScrapedItem[]> {
    const html = await this.fetchPage(url);
    const $ = cheerio.load(html);
    const items: ScrapedItem[] = [];

    const containerSelector = this.config.selectors?.container || "body";
    const titleSelector = this.config.selectors?.title || "h1, h2, h3";
    const contentSelector = this.config.selectors?.content || "p";
    const urlSelector = this.config.selectors?.url || "a";
    const dateSelector = this.config.selectors?.date;

    $(containerSelector).each((_, element) => {
      const $el = $(element);
      const title = $el.find(titleSelector).first().text().trim();
      const content = $el.find(contentSelector).text().trim();
      const itemUrl = $el.find(urlSelector).first().attr("href");
      let publishedAt: Date | undefined;

      if (dateSelector) {
        const dateText = $el.find(dateSelector).first().text().trim();
        publishedAt = this.parseDate(dateText);
      }

      if (title && content) {
        items.push({
          title,
          content,
          url: itemUrl ? this.resolveUrl(url, itemUrl) : undefined,
          publishedAt,
        });
      }
    });

    return items;
  }

  /**
   * Scraping via RSS feed
   */
  protected async scrapeRSS(url: string): Promise<ScrapedItem[]> {
    const feed = await this.rssParser.parseURL(url);
    const items: ScrapedItem[] = [];

    for (const item of feed.items) {
      items.push({
        title: item.title || "",
        content: item.contentSnippet || item.content || "",
        url: item.link,
        publishedAt: item.pubDate ? new Date(item.pubDate) : undefined,
      });
    }

    return items;
  }

  /**
   * Método principal de scraping
   */
  async scrape(url: string): Promise<ScrapedItem[]> {
    try {
      if (this.config.type === "rss") {
        return await this.scrapeRSS(url);
      } else if (this.config.type === "scraper") {
        return await this.scrapeHTML(url);
      }
      return [];
    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
      throw error;
    }
  }

  /**
   * Utilitários
   */
  protected resolveUrl(baseUrl: string, relativeUrl: string): string {
    try {
      return new URL(relativeUrl, baseUrl).href;
    } catch {
      return relativeUrl;
    }
  }

  protected parseDate(dateStr: string): Date | undefined {
    try {
      // Tenta vários formatos de data brasileiros
      const patterns = [
        /(\d{2})\/(\d{2})\/(\d{4})/, // DD/MM/YYYY
        /(\d{2})-(\d{2})-(\d{4})/, // DD-MM-YYYY
        /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
      ];

      for (const pattern of patterns) {
        const match = dateStr.match(pattern);
        if (match) {
          if (pattern === patterns[2]) {
            // YYYY-MM-DD
            return new Date(`${match[1]}-${match[2]}-${match[3]}`);
          } else {
            // DD/MM/YYYY ou DD-MM-YYYY
            return new Date(`${match[3]}-${match[2]}-${match[1]}`);
          }
        }
      }

      // Fallback para Date.parse
      const parsed = Date.parse(dateStr);
      if (!isNaN(parsed)) {
        return new Date(parsed);
      }
    } catch {
      // Ignore parsing errors
    }
    return undefined;
  }

  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
