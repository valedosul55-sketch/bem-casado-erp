import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import forge from "node-forge";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Carrega certificado e chave privada do arquivo PEM
 */
export function loadCertificate() {
  const pemPath = path.join(__dirname, "certificado.pem");
  
  if (!fs.existsSync(pemPath)) {
    throw new Error("Certificado PEM não encontrado em: " + pemPath);
  }

  const pemData = fs.readFileSync(pemPath, "utf8");

  // Extrair certificado
  const certMatch = pemData.match(/-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/);
  if (!certMatch) {
    throw new Error("Certificado não encontrado no arquivo PEM");
  }
  const certificatePem = certMatch[0];
  const certificate = forge.pki.certificateFromPem(certificatePem);

  // Extrair chave privada
  const keyMatch = pemData.match(/-----BEGIN PRIVATE KEY-----[\s\S]+?-----END PRIVATE KEY-----/);
  if (!keyMatch) {
    throw new Error("Chave privada não encontrada no arquivo PEM");
  }
  const privateKeyPem = keyMatch[0];
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

  // Validar validade do certificado
  const now = new Date();
  if (now < certificate.validity.notBefore || now > certificate.validity.notAfter) {
    throw new Error(
      `Certificado expirado ou ainda não válido. Válido de ${certificate.validity.notBefore} até ${certificate.validity.notAfter}`
    );
  }

  return {
    privateKey,
    certificate,
    privateKeyPem,
    certificatePem,
    subject: certificate.subject.attributes.map(attr => ({
      name: attr.name,
      value: attr.value
    })),
    issuer: certificate.issuer.attributes.map(attr => ({
      name: attr.name,
      value: attr.value
    })),
    validFrom: certificate.validity.notBefore,
    validTo: certificate.validity.notAfter,
    serialNumber: certificate.serialNumber,
  };
}

/**
 * Obtém certificado em formato base64 (sem headers)
 */
export function getCertificateBase64(): string {
  const cert = loadCertificate();
  return cert.certificatePem
    .replace("-----BEGIN CERTIFICATE-----", "")
    .replace("-----END CERTIFICATE-----", "")
    .replace(/\n/g, "");
}
