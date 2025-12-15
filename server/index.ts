import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import cron from "node-cron";
import { performBackup } from "./services/backup";
import { initializeScheduler } from "./scheduler";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Serve static files from dist/public in production
  // Em produção (Railway), o script de start roda 'node dist/index.js'
  // A estrutura de pastas no build é:
  // /app/dist/index.js
  // /app/dist/public/index.html
  // Portanto, __dirname será /app/dist, e public estará em /app/dist/public
  
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  console.log(`[Server] Environment: ${process.env.NODE_ENV}`);
  console.log(`[Server] Static path resolved to: ${staticPath}`);

  // Configurar headers de cache para assets estáticos
  app.use(express.static(staticPath, {
    setHeaders: (res, filePath) => {
      // Arquivos com hash no nome (gerados pelo Vite) podem ter cache longo
      if (filePath.match(/\.[a-f0-9]{8}\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
      // index.html e outros arquivos HTML nunca devem ser cacheados
      else if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
      // Outros arquivos: cache moderado
      else {
        res.setHeader('Cache-Control', 'public, max-age=3600');
      }
    },
  }));

  // Agendamento de Backup Automático
  // Executa todos os dias às 02:00 da manhã (horário do servidor/UTC)
  cron.schedule("0 2 * * *", () => {
    console.log("[Cron] Iniciando backup agendado...");
    performBackup();
  });
  console.log("[Server] Sistema de backup automático agendado para 02:00 UTC");

  // Endpoint manual para testar backup (protegido por segredo simples ou apenas logado)
  // Em produção real, deve ser protegido. Aqui deixaremos oculto.
  app.post("/api/admin/trigger-backup", async (req, res) => {
    const authHeader = req.headers.authorization;
    // Verificação simples usando o token da Focus NFe como "senha" de admin, já que só o dono tem
    if (authHeader !== `Bearer ${process.env.FOCUS_NFE_TOKEN}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    console.log("[API] Backup manual solicitado via API");
    // Executa em background para não travar a requisição
    performBackup().catch(err => console.error("Erro no backup manual:", err));
    
    res.json({ message: "Backup iniciado em background" });
  });

  // Endpoint para gerar PDF do DANFE
  app.get("/api/danfe-pdf/:chave", async (req, res) => {
    const { chave } = req.params;
    
    if (!chave) {
      return res.status(400).send("Chave da nota não informada");
    }

    try {
      // URL do DANFE na Focus NFe (Homologação ou Produção)
      const baseUrl = process.env.FOCUS_NFE_ENV === 'production' 
        ? 'https://api.focusnfe.com.br'
        : 'https://homologacao.focusnfe.com.br';
        
      const danfeUrl = `${baseUrl}/notas_fiscais_consumidor/${chave}.html`;
      
      console.log(`[PDF] Gerando PDF para: ${danfeUrl}`);

      // Usar weasyprint via shell para converter
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      const fs = await import('fs/promises');
      const tempPdfPath = path.resolve(__dirname, `temp_${chave}.pdf`);

      // Comando: python3 -m weasyprint URL OUTPUT
      await execAsync(`python3 -m weasyprint "${danfeUrl}" "${tempPdfPath}"`);

      // Ler o arquivo gerado
      const pdfBuffer = await fs.readFile(tempPdfPath);

      // Limpar arquivo temporário
      await fs.unlink(tempPdfPath).catch(console.error);

      // Enviar resposta
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="DANFE_${chave}.pdf"`);
      res.send(pdfBuffer);

    } catch (error: any) {
      console.error("[PDF] Erro ao gerar PDF:", error);
      res.status(500).send(`Erro ao gerar PDF: ${error.message}`);
    }
  });

  // Endpoint de diagnóstico SMTP
  app.get("/api/debug/smtp", (_req, res) => {
    const smtpUser = process.env.SMTP_EMAIL_USER;
    const smtpPass = process.env.SMTP_EMAIL_PASS;
    
    res.json({
      timestamp: new Date().toISOString(),
      smtp: {
        user: {
          exists: !!smtpUser,
          value: smtpUser ? smtpUser.substring(0, 10) + '...' : null,
          length: smtpUser?.length || 0,
          trimmed: smtpUser?.trim() === smtpUser,
        },
        pass: {
          exists: !!smtpPass,
          length: smtpPass?.length || 0,
          trimmed: smtpPass?.trim() === smtpPass,
        },
      },
      allEnvVars: Object.keys(process.env).filter(key => key.includes('SMTP')),
    });
  });

  // Handle client-side routing - serve index.html for all routes
  // IMPORTANTE: Isso deve vir DEPOIS de todas as rotas de API
  app.get("*", (req, res) => {
    // Se a requisição for para API e não foi tratada acima, retorna 404
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }

    // Para qualquer outra rota, serve o index.html (SPA)
    const indexPath = path.join(staticPath, "index.html");
    
    // Garantir que index.html nunca seja cacheado
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error(`[Server] Error serving index.html from ${indexPath}:`, err);
        res.status(500).send("Error loading application");
      }
    });
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    
    // Inicializar scheduler de monitoramento
    console.log("[Server] Inicializando sistema de monitoramento...");
    initializeScheduler();
  });
}

startServer().catch(console.error);
