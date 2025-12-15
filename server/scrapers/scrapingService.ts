import { createScraper } from "./officialScrapers";
import {
  getActiveSources,
  createUpdate,
  createScrapingLog,
  updateSourceLastScraped,
  checkUpdateExists,
} from "../monitorDb";
import { invokeLLM } from "../_core/llm";

export interface ScrapingResult {
  sourceId: number;
  sourceName: string;
  status: "success" | "error" | "partial";
  itemsFound: number;
  itemsNew: number;
  errorMessage?: string;
  executionTime: number;
}

/**
 * Executa scraping de uma fonte específica
 */
export async function scrapeSource(
  sourceId: number,
  sourceName: string,
  sourceUrl: string
): Promise<ScrapingResult> {
  const startTime = Date.now();
  const result: ScrapingResult = {
    sourceId,
    sourceName,
    status: "success",
    itemsFound: 0,
    itemsNew: 0,
    executionTime: 0,
  };

  try {
    // Criar scraper apropriado
    const scraper = createScraper(sourceName);
    if (!scraper) {
      throw new Error(`No scraper available for source: ${sourceName}`);
    }

    // Executar scraping
    const items = await scraper.scrape(sourceUrl);
    result.itemsFound = items.length;

    // Processar cada item
    for (const item of items) {
      try {
        // Verificar se já existe
        const exists = await checkUpdateExists(item.title, sourceId);
        if (exists) {
          continue;
        }

        // Analisar relevância com IA
        const analysis = await analyzeRelevance(item.title, item.content);

        // Salvar no banco de dados
        await createUpdate({
          sourceId,
          categoryId: 1, // TODO: determinar categoria correta
          title: item.title,
          content: item.content,
          summary: analysis.summary,
          url: item.url,
          publishedAt: item.publishedAt,
          relevanceScore: analysis.score,
          isRelevant: analysis.score >= 50 ? 1 : 0,
          isRead: 0,
          tags: JSON.stringify(analysis.tags),
        });

        result.itemsNew++;
      } catch (error) {
        console.error(`Error processing item: ${item.title}`, error);
        result.status = "partial";
      }
    }

    // Atualizar timestamp da fonte
    await updateSourceLastScraped(sourceId);
  } catch (error) {
    result.status = "error";
    result.errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Error scraping source ${sourceName}:`, error);
  }

  result.executionTime = Date.now() - startTime;

  // Salvar log
  await createScrapingLog({
    sourceId,
    status: result.status,
    itemsFound: result.itemsFound,
    itemsNew: result.itemsNew,
    errorMessage: result.errorMessage,
    executionTime: result.executionTime,
  });

  return result;
}

/**
 * Executa scraping de todas as fontes ativas
 */
export async function scrapeAllSources(): Promise<ScrapingResult[]> {
  const sources = await getActiveSources();
  const results: ScrapingResult[] = [];

  console.log(`Starting scraping of ${sources.length} active sources...`);

  for (const source of sources) {
    try {
      const result = await scrapeSource(source.id, source.name, source.url);
      results.push(result);
      console.log(
        `Scraped ${source.name}: ${result.itemsNew} new items out of ${result.itemsFound} found`
      );

      // Aguardar entre requisições para não sobrecarregar servidores
      await sleep(2000);
    } catch (error) {
      console.error(`Failed to scrape source ${source.name}:`, error);
      results.push({
        sourceId: source.id,
        sourceName: source.name,
        status: "error",
        itemsFound: 0,
        itemsNew: 0,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        executionTime: 0,
      });
    }
  }

  console.log(`Scraping completed: ${results.length} sources processed`);
  return results;
}

/**
 * Analisa relevância de um item usando IA
 */
async function analyzeRelevance(
  title: string,
  content: string
): Promise<{ score: number; summary: string; tags: string[] }> {
  try {
    const prompt = `Analise a seguinte notícia/atualização e determine:
1. Relevância para uma empresa de varejo de alimentos (arroz, feijão, açúcar) - score de 0 a 100
2. Resumo em 2-3 frases
3. Tags relevantes (máximo 5)

Título: ${title}
Conteúdo: ${content.substring(0, 1000)}

Responda em JSON com: { "score": number, "summary": string, "tags": string[] }`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "Você é um analista especializado em legislação fiscal, contábil e agronegócio. Responda sempre em JSON válido.",
        },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "relevance_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              score: { type: "integer", description: "Relevance score from 0 to 100" },
              summary: { type: "string", description: "Brief summary in 2-3 sentences" },
              tags: {
                type: "array",
                items: { type: "string" },
                description: "Up to 5 relevant tags",
              },
            },
            required: ["score", "summary", "tags"],
            additionalProperties: false,
          },
        },
      },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      score: result.score || 50,
      summary: result.summary || title,
      tags: result.tags || [],
    };
  } catch (error) {
    console.error("Error analyzing relevance with AI:", error);
    // Fallback: análise simples baseada em keywords
    return {
      score: 50,
      summary: title,
      tags: extractKeywords(title + " " + content),
    };
  }
}

/**
 * Extrai keywords simples como fallback
 */
function extractKeywords(text: string): string[] {
  const keywords = [
    "fiscal",
    "contábil",
    "tributário",
    "icms",
    "pis",
    "cofins",
    "nf-e",
    "sped",
    "agronegócio",
    "arroz",
    "feijão",
  ];

  const lowerText = text.toLowerCase();
  return keywords.filter((keyword) => lowerText.includes(keyword)).slice(0, 5);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
