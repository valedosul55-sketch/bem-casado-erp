/**
 * Script para popular o banco de dados com categorias e fontes iniciais
 * Execute com: npx tsx server/seedMonitor.ts
 */

import { db } from "./db";
import { monitorCategories, monitorSources } from "../drizzle/schema";

async function seed() {
  console.log("Iniciando seed do sistema de monitoramento...");

  try {
    // Criar categorias
    console.log("Criando categorias...");
    const categories = [
      {
        name: "Fiscal",
        description: "Legislação fiscal, tributária e notas fiscais eletrônicas",
      },
      {
        name: "Contábil",
        description: "Normas contábeis, CFC, CPC e regulamentações contábeis",
      },
      {
        name: "Agronegócio",
        description: "Notícias e regulamentações do setor de agronegócio e grãos",
      },
    ];

    for (const category of categories) {
      await db.insert(monitorCategories).values(category).onDuplicateKeyUpdate({
        set: { description: category.description },
      });
    }
    console.log("✅ Categorias criadas");

    // Criar fontes
    console.log("Criando fontes de monitoramento...");
    const sources = [
      {
        name: "DOU",
        url: "https://www.in.gov.br/rss/dou1.xml",
        type: "rss" as const,
        categoryId: 1,
        isActive: 1,
        scrapingConfig: JSON.stringify({ sections: [1, 2, 3] }),
      },
      {
        name: "Receita Federal",
        url: "https://www.gov.br/receitafederal/pt-br/assuntos/noticias",
        type: "scraper" as const,
        categoryId: 1,
        isActive: 1,
        scrapingConfig: JSON.stringify({
          selectors: {
            container: ".noticia",
            title: "h2",
            content: ".texto",
          },
        }),
      },
      {
        name: "CFC",
        url: "https://cfc.org.br/feed/",
        type: "rss" as const,
        categoryId: 2,
        isActive: 1,
        scrapingConfig: null,
      },
      {
        name: "MAPA",
        url: "https://www.gov.br/agricultura/pt-br/assuntos/noticias",
        type: "scraper" as const,
        categoryId: 3,
        isActive: 1,
        scrapingConfig: JSON.stringify({
          selectors: {
            container: ".noticia-item",
            title: "h2",
            content: ".resumo",
          },
        }),
      },
      {
        name: "CONAB",
        url: "https://www.conab.gov.br/ultimas-noticias",
        type: "scraper" as const,
        categoryId: 3,
        isActive: 1,
        scrapingConfig: JSON.stringify({
          selectors: {
            container: ".noticia",
            title: "h2",
            content: ".texto",
          },
        }),
      },
    ];

    for (const source of sources) {
      await db.insert(monitorSources).values(source).onDuplicateKeyUpdate({
        set: { url: source.url, isActive: source.isActive },
      });
    }
    console.log("✅ Fontes criadas");

    console.log("\n✅ Seed concluído com sucesso!");
    console.log("\nPróximos passos:");
    console.log("1. Configure a variável RESEND_API_KEY para envio de emails");
    console.log("2. Execute o servidor: pnpm dev");
    console.log("3. Acesse /monitor para ver o dashboard");
    console.log("4. Use o botão 'Atualizar Agora' para executar o primeiro scraping");
  } catch (error) {
    console.error("❌ Erro durante seed:", error);
    throw error;
  } finally {
    process.exit(0);
  }
}

seed();
