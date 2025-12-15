import { emitirNFCe } from './server/focus-nfe';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

async function testarEmissaoProducao() {
  console.log('=== INICIANDO TESTE DE EMISSÃO EM PRODUÇÃO ===');
  console.log('Ambiente:', process.env.FOCUS_NFE_ENV);
  console.log('Token (primeiros 5 chars):', process.env.FOCUS_NFE_TOKEN?.substring(0, 5));

  // Dados do teste
  const itemTeste = {
    codigo: 'TESTE001',
    descricao: 'ITEM DE TESTE SISTEMA PDV',
    quantidade: 1,
    preco: 0.01, // R$ 0,01
    ncm: '10063021' // Arroz (Isento/Reduzido) - Usando NCM válido para evitar rejeição
  };

  const cpfCliente = '05521732829'; // CPF do usuário
  const nomeCliente = 'CLIENTE TESTE PRODUCAO';

  try {
    console.log('\nEnviando requisição para Focus NFe...');
    const resultado = await emitirNFCe(
      [itemTeste],
      0.01,
      cpfCliente,
      nomeCliente,
      undefined, // IE
      undefined, // UF
      '01', // Dinheiro
      undefined, // Endereço
      undefined // Deixar automático (vai pegar Série 2, Número 1 do painel)
    );

    console.log('\n=== RESULTADO ===');
    console.log('Status:', resultado.status);
    console.log('Mensagem SEFAZ:', resultado.mensagem_sefaz);
    
    if (resultado.status === 'autorizado') {
      console.log('✅ SUCESSO! Nota autorizada.');
      console.log('Número:', resultado.numero);
      console.log('Série:', resultado.serie);
      console.log('Chave:', resultado.chave_nfe);
      console.log('URL Consulta:', resultado.url_consulta_nf);
      console.log('Caminho DANFE:', resultado.caminho_danfe);
    } else {
      console.log('⚠️ Nota não autorizada imediatamente.');
      console.log('Erros:', JSON.stringify(resultado.erros, null, 2));
    }

  } catch (error: any) {
    console.error('\n❌ ERRO FATAL:');
    console.error(error.message);
    if (error.response) {
      console.error('Dados do erro:', error.response.data);
    }
  }
}

testarEmissaoProducao();
