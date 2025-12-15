import { loadCertificate } from "./server/nfce-certificate.ts";

try {
  console.log("🔐 Carregando certificado digital A1...\n");
  
  const cert = loadCertificate();
  
  console.log("✅ Certificado carregado com sucesso!\n");
  console.log("📋 Informações do certificado:");
  console.log("  Subject:", cert.subject.map(a => `${a.name}=${a.value}`).join(", "));
  console.log("  Issuer:", cert.issuer.map(a => `${a.name}=${a.value}`).join(", "));
  console.log("  Serial:", cert.serialNumber);
  console.log("  Válido de:", cert.validFrom);
  console.log("  Válido até:", cert.validTo);
  
  const now = new Date();
  const daysUntilExpiry = Math.floor((cert.validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  console.log(`  Dias restantes: ${daysUntilExpiry} dias`);
  
  if (daysUntilExpiry < 30) {
    console.log("\n⚠️  ATENÇÃO: Certificado expira em menos de 30 dias!");
  }
  
} catch (error) {
  console.error("❌ Erro ao carregar certificado:", error.message);
  process.exit(1);
}
