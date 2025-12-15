
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
config({ path: resolve(__dirname, '.env') });

import { emitirNFCe } from './server/focus-nfe';

async function testPdfFlow() {
  console.log('🚀 Iniciando Teste Integrado: Venda + PDF Automático');

  // 1. Simular Venda
  const items = [
    {
      codigo: '7896285901018', // EAN Arroz Branco
      descricao: 'ARROZ BRANCO TIPO 1 BEM CASADO 10KG',
      quantidade: 1,
      preco: 23.00,
      ncm: '10063021'
    }
  ];
  const total = 23.00;
  const formaPagamento = '01'; // Dinheiro

  try {
    console.log('\n📡 1. Emitindo NFC-e...');
    
    // Emissão sem CPF para garantir aprovação rápida
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
      throw new Error(`NFC-e não autorizada: ${result.status} - ${result.mensagem_sefaz}`);
    }

    console.log(`✅ NFC-e Autorizada! Chave: ${result.chave_nfe}`);

    // 2. Testar Geração de PDF
    console.log('\n📄 2. Solicitando PDF ao Backend...');
    
    // Simular a chamada que o frontend faria para /api/danfe-pdf/:chave
    // Como estamos no script, vamos chamar o weasyprint diretamente para validar a lógica
    // (A rota do express faz exatamente isso)
    
    const baseUrl = process.env.FOCUS_NFE_ENV === 'production' 
        ? 'https://api.focusnfe.com.br'
        : 'https://homologacao.focusnfe.com.br';
        
    const danfeUrl = `${baseUrl}/notas_fiscais_consumidor/${result.chave_nfe}.html`;
    const outputPath = path.resolve(__dirname, `TESTE_PDF_AUTO_${result.numero}.pdf`);
    
    console.log(`   URL Fonte: ${danfeUrl}`);
    console.log(`   Gerando em: ${outputPath}`);

    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    await execAsync(`python3 -m weasyprint "${danfeUrl}" "${outputPath}"`);

    // Verificar se arquivo existe
    const stats = await fs.stat(outputPath);
    
    if (stats.size > 0) {
      console.log(`\n✅ SUCESSO! PDF gerado com ${stats.size} bytes.`);
      console.log(`📂 Arquivo pronto: ${outputPath}`);
    } else {
      throw new Error('Arquivo PDF gerado está vazio.');
    }

  } catch (error: any) {
    console.error('\n❌ Falha no teste:', error.message || error);
  }
}

testPdfFlow();
