import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function performBackup() {
  console.log("[Backup] Iniciando processo de backup...");

  const {
    DATABASE_URL,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_REGION,
    AWS_BUCKET_NAME,
  } = process.env;

  if (!DATABASE_URL) {
    console.error("[Backup] Erro: DATABASE_URL não definida.");
    return;
  }

  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION || !AWS_BUCKET_NAME) {
    console.error("[Backup] Erro: Credenciais AWS S3 incompletas.");
    return;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `backup-${timestamp}.sql.gz`;
  const tempPath = path.resolve(__dirname, `../../temp_${filename}`);

  try {
    // 1. Realizar dump do banco de dados
    console.log("[Backup] Gerando dump do banco de dados...");
    // Usar pg_dump para gerar backup compactado
    // Nota: pg_dump deve estar instalado no sistema
    await execAsync(`pg_dump "${DATABASE_URL}" | gzip > "${tempPath}"`);
    
    // Verificar se o arquivo foi criado e tem tamanho > 0
    const stats = await fs.stat(tempPath);
    if (stats.size === 0) {
      throw new Error("Arquivo de backup gerado está vazio.");
    }
    console.log(`[Backup] Dump gerado com sucesso: ${filename} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

    // 2. Upload para o S3
    console.log("[Backup] Enviando para o S3...");
    const s3Client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });

    const fileContent = await fs.readFile(tempPath);

    await s3Client.send(
      new PutObjectCommand({
        Bucket: AWS_BUCKET_NAME,
        Key: `backups/${filename}`,
        Body: fileContent,
        ContentType: "application/gzip",
      })
    );

    console.log(`[Backup] Upload concluído com sucesso: s3://${AWS_BUCKET_NAME}/backups/${filename}`);

  } catch (error: any) {
    console.error("[Backup] Falha no processo de backup:", error);
  } finally {
    // 3. Limpeza
    try {
      await fs.unlink(tempPath);
      console.log("[Backup] Arquivo temporário removido.");
    } catch (e) {
      // Ignorar erro se arquivo não existir
    }
  }
}
