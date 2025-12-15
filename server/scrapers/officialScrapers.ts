import { BaseScraper, ScrapedItem } from "./baseScraper";

/**
 * Scraper para Diário Oficial da União (DOU)
 */
export class DOUScraper extends BaseScraper {
  constructor() {
    super({
      type: "rss",
    });
  }

  async scrape(): Promise<ScrapedItem[]> {
    // DOU oferece RSS feeds por seção
    const feeds = [
      "https://www.in.gov.br/rss/dou1.xml", // Seção 1
      "https://www.in.gov.br/rss/dou2.xml", // Seção 2
      "https://www.in.gov.br/rss/dou3.xml", // Seção 3
    ];

    const allItems: ScrapedItem[] = [];

    for (const feedUrl of feeds) {
      try {
        const items = await super.scrape(feedUrl);
        // Filtrar apenas itens relevantes (Receita Federal, tributação, etc.)
        const filtered = items.filter((item) =>
          this.isRelevant(item.title + " " + item.content)
        );
        allItems.push(...filtered);
      } catch (error) {
        console.error(`Error scraping DOU feed ${feedUrl}:`, error);
      }
    }

    return allItems;
  }

  private isRelevant(text: string): boolean {
    const keywords = [
      "receita federal",
      "tributário",
      "tributária",
      "icms",
      "pis",
      "cofins",
      "simples nacional",
      "nota fiscal",
      "nf-e",
      "nfc-e",
      "sped",
      "agronegócio",
      "agricultura",
      "arroz",
      "feijão",
      "grãos",
    ];

    const lowerText = text.toLowerCase();
    return keywords.some((keyword) => lowerText.includes(keyword));
  }
}

/**
 * Scraper para Receita Federal
 */
export class ReceitaFederalScraper extends BaseScraper {
  constructor() {
    super({
      type: "scraper",
      selectors: {
        container: ".noticia, .destaque",
        title: "h2, h3, .titulo",
        content: ".texto, .conteudo, p",
        url: "a",
        date: ".data, time",
      },
    });
  }

  async scrape(): Promise<ScrapedItem[]> {
    const urls = [
      "https://www.gov.br/receitafederal/pt-br/assuntos/noticias",
      "https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria",
    ];

    const allItems: ScrapedItem[] = [];

    for (const url of urls) {
      try {
        const items = await super.scrape(url);
        allItems.push(...items);
      } catch (error) {
        console.error(`Error scraping Receita Federal ${url}:`, error);
      }
    }

    return allItems;
  }
}

/**
 * Scraper para CFC (Conselho Federal de Contabilidade)
 */
export class CFCScraper extends BaseScraper {
  constructor() {
    super({
      type: "rss",
    });
  }

  async scrape(): Promise<ScrapedItem[]> {
    try {
      // CFC tem RSS feed de notícias
      return await super.scrape("https://cfc.org.br/feed/");
    } catch (error) {
      console.error("Error scraping CFC:", error);
      return [];
    }
  }
}

/**
 * Scraper para MAPA (Ministério da Agricultura)
 */
export class MAPAScraper extends BaseScraper {
  constructor() {
    super({
      type: "scraper",
      selectors: {
        container: ".noticia-item, .card-noticia",
        title: "h2, h3, .titulo",
        content: ".resumo, .texto, p",
        url: "a",
        date: ".data, time",
      },
    });
  }

  async scrape(): Promise<ScrapedItem[]> {
    try {
      const items = await super.scrape("https://www.gov.br/agricultura/pt-br/assuntos/noticias");

      // Filtrar apenas notícias sobre grãos
      return items.filter((item) => {
        const text = (item.title + " " + item.content).toLowerCase();
        return (
          text.includes("arroz") ||
          text.includes("feijão") ||
          text.includes("feijao") ||
          text.includes("grãos") ||
          text.includes("graos")
        );
      });
    } catch (error) {
      console.error("Error scraping MAPA:", error);
      return [];
    }
  }
}

/**
 * Scraper para CONAB (Companhia Nacional de Abastecimento)
 */
export class CONABScraper extends BaseScraper {
  constructor() {
    super({
      type: "scraper",
      selectors: {
        container: ".noticia, .item-noticia",
        title: "h2, h3",
        content: ".texto, p",
        url: "a",
        date: ".data",
      },
    });
  }

  async scrape(): Promise<ScrapedItem[]> {
    try {
      return await super.scrape("https://www.conab.gov.br/ultimas-noticias");
    } catch (error) {
      console.error("Error scraping CONAB:", error);
      return [];
    }
  }
}

/**
 * Factory para criar scrapers
 */
export function createScraper(sourceName: string): BaseScraper | null {
  switch (sourceName.toLowerCase()) {
    case "dou":
    case "diário oficial da união":
      return new DOUScraper();
    case "receita federal":
      return new ReceitaFederalScraper();
    case "cfc":
      return new CFCScraper();
    case "mapa":
    case "ministério da agricultura":
      return new MAPAScraper();
    case "conab":
      return new CONABScraper();
    default:
      return null;
  }
}
