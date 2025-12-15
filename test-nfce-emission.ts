
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente ANTES de importar qualquer módulo que as use
config({ path: resolve(__dirname, '.env') });

// Agora sim importar o módulo que usa as variáveis
import { emitirNFCe } from './server/focus-nfe';

async function testNFCeEmission() {
  console.log('🚀 Iniciando teste de emissão de NFC-e...');

  // Verificar se o token está configurado
  if (!process.env.FOCUS_NFE_TOKEN) {
    console.error('❌ FOCUS_NFE_TOKEN não configurado no .env');
    process.exit(1);
  }

  console.log('🔑 Token encontrado. Ambiente:', process.env.FOCUS_NFE_ENV || 'homologacao');

  // Dados simulados de venda
  const items = [
    {
      codigo: '7891234567890',
      descricao: 'PRODUTO TESTE BEM CASADO',
      quantidade: 1,
      preco: 1.50,
      ncm: '10063021' // Arroz
    }
  ];

  const total = 1.50;
  const nomeCliente = 'CLIENTE TESTE HOMOLOGACAO';
  const formaPagamento = '17'; // PIX

  try {
    console.log(`📡 Enviando requisição para Focus NFe (Pagamento: ${formaPagamento} - PIX)...`);
    
    const result = await emitirNFCe(
      items,
      total,
      undefined, // CPF opcional
      nomeCliente,
      undefined, // IE
      undefined, // UF
      formaPagamento
    );

    console.log('\n✅ Resultado da Emissão:');
    console.log(JSON.stringify(result, null, 2));

    if (result.status === 'autorizado') {
      console.log('\n🎉 SUCESSO! NFC-e autorizada.');
      console.log(`🔗 URL DANFE: ${result.caminho_danfe}`);
    } else if (result.status === 'processando') {
      console.log('\n⏳ PROCESSANDO... A nota foi recebida e está sendo processada.');
    } else {
      console.log('\n⚠️ Nota não autorizada imediatamente.');
    }

  } catch (error: any) {
    console.error('\n❌ Erro no teste:');
    console.error(error.message || error);
  }
}

testNFCeEmission();
