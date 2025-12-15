import cron from "node-cron";
import { scrapeAllSources } from "./scrapers/scrapingService";
import { sendDailyDigest } from "./emailService";
import { getRecentUpdates } from "./monitorDb";
import { NewsMonitoringAgent } from "./agents/newsMonitoringAgent";

/**
 * Configuração de agendamentos
 */
export function initializeScheduler() {
  console.log("Initializing monitoring scheduler...");

  // Scraping diário às 6h da manhã
  cron.schedule(
    "0 6 * * *",
    async () => {
      console.log("Starting daily scraping job...");
      try {
        const results = await scrapeAllSources();
        const totalNew = results.reduce((sum, r) => sum + r.itemsNew, 0);
        console.log(`Daily scraping completed: ${totalNew} new items found`);
      } catch (error) {
        console.error("Error in daily scraping job:", error);
      }
    },
    {
      timezone: "America/Sao_Paulo",
    }
  );

  // Envio de digest diário às 8h da manhã
  cron.schedule(
    "0 8 * * *",
    async () => {
      console.log("Starting daily digest email job...");
      try {
        const updates = await getRecentUpdates(1); // Últimas 24h
        if (updates.length > 0) {
          await sendDailyDigest(updates);
          console.log(`Daily digest sent with ${updates.length} updates`);
        } else {
          console.log("No updates to send in daily digest");
        }
      } catch (error) {
        console.error("Error in daily digest job:", error);
      }
    },
    {
      timezone: "America/Sao_Paulo",
    }
  );

  // Scraping adicional ao meio-dia (para fontes mais dinâmicas)
  cron.schedule(
    "0 12 * * *",
    async () => {
      console.log("Starting midday scraping job...");
      try {
        const results = await scrapeAllSources();
        const totalNew = results.reduce((sum, r) => sum + r.itemsNew, 0);
        if (totalNew > 0) {
          console.log(`Midday scraping completed: ${totalNew} new items found`);
        }
      } catch (error) {
        console.error("Error in midday scraping job:", error);
      }
    },
    {
      timezone: "America/Sao_Paulo",
    }
  );

  // Scraping final às 18h
  cron.schedule(
    "0 18 * * *",
    async () => {
      console.log("Starting evening scraping job...");
      try {
        const results = await scrapeAllSources();
        const totalNew = results.reduce((sum, r) => sum + r.itemsNew, 0);
        if (totalNew > 0) {
          console.log(`Evening scraping completed: ${totalNew} new items found`);
        }
      } catch (error) {
        console.error("Error in evening scraping job:", error);
      }
    },
    {
      timezone: "America/Sao_Paulo",
    }
  );

  // Agente de Monitoramento de Notícias Fiscais às 8h (dias úteis)
  const newsAgent = new NewsMonitoringAgent();
  cron.schedule(
    "0 8 * * 1-5", // Segunda a sexta, 08:00
    async () => {
      console.log("[NewsAgent] Iniciando monitoramento de notícias fiscais...");
      try {
        await newsAgent.monitorAndSendReport();
        console.log("[NewsAgent] Monitoramento concluído com sucesso");
      } catch (error) {
        console.error("[NewsAgent] Erro ao monitorar notícias:", error);
      }
    },
    {
      timezone: "America/Sao_Paulo",
    }
  );

  console.log("Scheduler initialized with 5 daily jobs:");
  console.log("  - 06:00: Main scraping");
  console.log("  - 08:00: Daily digest email + News monitoring (Mon-Fri)");
  console.log("  - 12:00: Midday scraping");
  console.log("  - 18:00: Evening scraping");
}

/**
 * Execução manual para testes
 */
export async function runManualScraping() {
  console.log("Running manual scraping...");
  const results = await scrapeAllSources();
  return results;
}

/**
 * Execução manual do agente de notícias fiscais
 */
export async function runNewsAgentManually() {
  console.log("[NewsAgent] Executando manualmente...");
  const newsAgent = new NewsMonitoringAgent();
  try {
    await newsAgent.monitorAndSendReport();
    console.log("[NewsAgent] Execução manual concluída com sucesso");
    return { success: true, message: "Agente executado com sucesso. Verifique seu email!" };
  } catch (error: any) {
    console.error("[NewsAgent] Erro na execução manual:", error);
    return { success: false, message: error.message || "Erro desconhecido" };
  }
}
