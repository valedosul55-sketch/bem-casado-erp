
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, '.env') });

import { emitirNFCe } from './server/focus-nfe';

async function testCnpjFlow() {
  console.log('🚀 Iniciando Teste: Venda para CNPJ');

  const items = [
    {
      codigo: '7896285901018',
      descricao: 'ARROZ BRANCO TIPO 1 BEM CASADO 10KG',
      quantidade: 1,
      preco: 23.00,
      ncm: '10063021'
    }
  ];
  const total = 23.00;
  
  // CNPJ Fornecido pelo Usuário
  const cnpjCliente = '28738768000186';
  const nomeCliente = 'CLIENTE TESTE CNPJ';
  const ieCliente = 'ISENTO'; // Geralmente não contribuintes ou isentos

  try {
    console.log(`\n📡 1. Emitindo NFC-e para CNPJ: ${cnpjCliente}...`);
    
    const result = await emitirNFCe(
      items,
      total,
      cnpjCliente, // Passando CNPJ aqui (a função detecta pelo tamanho 14)
      nomeCliente,
      ieCliente,
      'SP',
      '01',
      {
        logradouro: 'ESTRADA MUNICIPAL SANTO ANTONIO DO ALTO', // Endereço fictício em SJC para teste
        numero: '100',
        bairro: 'PARQUE NOVO HORIZONTE',
        municipio: 'São José dos Campos',
        cep: '12225810'
      }
    );

    if (result.status !== 'autorizado') {
      console.error('❌ Erro na emissão:', result.mensagem_sefaz);
      if (result.erros) console.error(JSON.stringify(result.erros, null, 2));
      return;
    }

    console.log(`✅ NFC-e Autorizada! Chave: ${result.chave_nfe}`);

    // 2. Gerar PDF
    console.log('\n📄 2. Gerando PDF...');
    
    const baseUrl = process.env.FOCUS_NFE_ENV === 'production' 
        ? 'https://api.focusnfe.com.br'
        : 'https://homologacao.focusnfe.com.br';
        
    const danfeUrl = `${baseUrl}/notas_fiscais_consumidor/${result.chave_nfe}.html`;
    const outputPath = path.resolve(__dirname, `TESTE_CNPJ_${result.numero}.pdf`);
    
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    await execAsync(`python3 -m weasyprint "${danfeUrl}" "${outputPath}"`);

    const stats = await fs.stat(outputPath);
    
    if (stats.size > 0) {
      console.log(`\n✅ SUCESSO! PDF CNPJ gerado.`);
      console.log(`📂 Arquivo: ${outputPath}`);
    }

  } catch (error: any) {
    console.error('\n❌ Falha no teste:', error.message || error);
  }
}

testCnpjFlow();
