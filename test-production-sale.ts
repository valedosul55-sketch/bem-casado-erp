
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, '.env') });

import { emitirNFCe } from './server/focus-nfe';

async function testProductionSale() {
  console.log('🚀 Iniciando Emissão REAL em PRODUÇÃO (R$ 0,01)');

  const items = [
    {
      codigo: '999999', // Código interno de teste
      descricao: 'ITEM DE TESTE SISTEMA',
      quantidade: 1,
      preco: 0.01,
      ncm: '10063021' // NCM de Arroz (Isento/Reduzido) para evitar problemas de alíquota alta
    }
  ];
  const total = 0.01;
  
  // CPF do Usuário
  const cpfCliente = '05521732829'; 
  const nomeCliente = 'CLIENTE VIP';

  try {
    console.log(`\n📡 1. Emitindo NFC-e para CPF: ${cpfCliente}...`);
    
    const result = await emitirNFCe(
      items,
      total,
      cpfCliente,
      nomeCliente,
      undefined,
      undefined, // Sem UF (Padrão para CPF presencial)
      '01' // Dinheiro
    );

    if (result.status !== 'autorizado') {
      console.error('❌ Erro na emissão:', result.mensagem_sefaz);
      if (result.erros) console.error(JSON.stringify(result.erros, null, 2));
      return;
    }

    console.log(`✅ NFC-e Autorizada! Chave: ${result.chave_nfe}`);
    console.log(`🔢 Número da Nota: ${result.numero}`);

    // 2. Gerar PDF
    console.log('\n📄 2. Gerando PDF...');
    
    const baseUrl = 'https://api.focusnfe.com.br'; // URL Produção
        
    const danfeUrl = `${baseUrl}/notas_fiscais_consumidor/${result.chave_nfe}.html`;
    const outputPath = path.resolve(__dirname, `NFCe_PRODUCAO_${result.numero}.pdf`);
    
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    await execAsync(`python3 -m weasyprint "${danfeUrl}" "${outputPath}"`);

    const stats = await fs.stat(outputPath);
    
    if (stats.size > 0) {
      console.log(`\n✅ SUCESSO! PDF Oficial gerado.`);
      console.log(`📂 Arquivo: ${outputPath}`);
    }

  } catch (error: any) {
    console.error('\n❌ Falha no teste:', error.message || error);
  }
}

testProductionSale();
