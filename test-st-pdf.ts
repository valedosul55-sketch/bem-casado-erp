
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, '.env') });

import { emitirNFCe } from './server/focus-nfe';

async function testStPdfFlow() {
  console.log('🚀 Iniciando Teste ST (Açúcar) + PDF Automático');

  // 1. Simular Venda de Açúcar (ST)
  const items = [
    {
      codigo: '7896285902176',
      descricao: 'ACUCAR CRISTAL BEM CASADO 10KG',
      quantidade: 1,
      preco: 29.90,
      ncm: '17019900' // NCM Açúcar (Gatilho para ST e CEST)
    }
  ];
  const total = 29.90;
  const formaPagamento = '01';

  try {
    console.log('\n📡 1. Emitindo NFC-e com ST...');
    
    const result = await emitirNFCe(
      items,
      total,
      undefined, 
      undefined,
      undefined,
      undefined,
      formaPagamento
    );

    if (result.status !== 'autorizado') {
      console.error('❌ Erro na emissão:', result.mensagem_sefaz);
      if (result.erros) console.error(JSON.stringify(result.erros, null, 2));
      return;
    }

    console.log(`✅ NFC-e Autorizada! Chave: ${result.chave_nfe}`);

    // 2. Testar Geração de PDF
    console.log('\n📄 2. Gerando PDF...');
    
    const baseUrl = process.env.FOCUS_NFE_ENV === 'production' 
        ? 'https://api.focusnfe.com.br'
        : 'https://homologacao.focusnfe.com.br';
        
    const danfeUrl = `${baseUrl}/notas_fiscais_consumidor/${result.chave_nfe}.html`;
    const outputPath = path.resolve(__dirname, `TESTE_ST_PDF_${result.numero}.pdf`);
    
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    await execAsync(`python3 -m weasyprint "${danfeUrl}" "${outputPath}"`);

    const stats = await fs.stat(outputPath);
    
    if (stats.size > 0) {
      console.log(`\n✅ SUCESSO! PDF ST gerado com ${stats.size} bytes.`);
      console.log(`📂 Arquivo: ${outputPath}`);
    }

  } catch (error: any) {
    console.error('\n❌ Falha no teste:', error.message || error);
  }
}

testStPdfFlow();
