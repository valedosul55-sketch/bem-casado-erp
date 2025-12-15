/**
 * Script de teste para geração de IDs com timestamp
 */

import {
  generateNFCeReference,
  generatePixReference,
  generateOrderReference,
  extractDateFromId,
  formatIdForDisplay,
} from './server/id-generator';

async function testarGeracaoIds() {
  console.log('='.repeat(80));
  console.log('TESTE DE GERAÇÃO DE IDs COM DATA/HORA');
  console.log('='.repeat(80));
  console.log();

  // Testa geração de IDs
  console.log('📋 Gerando IDs...');
  console.log('-'.repeat(80));
  
  const nfceId = generateNFCeReference();
  const pixId = generatePixReference();
  const orderId = generateOrderReference();
  
  console.log(`NFC-e: ${nfceId}`);
  console.log(`PIX: ${pixId}`);
  console.log(`Pedido: ${orderId}`);
  console.log();

  // Valida formato
  console.log('✅ Validando formato...');
  console.log('-'.repeat(80));
  
  const regexFormato = /^[A-Z]+_\d{8}_\d{6}_\d{3}$/;
  
  const idsParaValidar = [
    { nome: 'NFC-e', id: nfceId, prefixoEsperado: 'VENDA' },
    { nome: 'PIX', id: pixId, prefixoEsperado: 'PIX' },
    { nome: 'Pedido', id: orderId, prefixoEsperado: 'PEDIDO' },
  ];

  let todosValidos = true;
  
  for (const { nome, id, prefixoEsperado } of idsParaValidar) {
    const valido = regexFormato.test(id);
    const prefixo = id.split('_')[0];
    const prefixoCorreto = prefixo === prefixoEsperado;
    
    if (valido && prefixoCorreto) {
      console.log(`✅ ${nome}: formato válido`);
    } else {
      console.log(`❌ ${nome}: formato inválido`);
      todosValidos = false;
    }
  }
  
  console.log();

  // Testa extração de data
  console.log('📅 Testando extração de data...');
  console.log('-'.repeat(80));
  
  const dataExtraida = extractDateFromId(nfceId);
  
  if (dataExtraida) {
    console.log(`✅ Data extraída com sucesso: ${dataExtraida.toLocaleString('pt-BR')}`);
    
    // Valida que a data é recente (últimos 5 segundos)
    const agora = new Date();
    const diferencaMs = agora.getTime() - dataExtraida.getTime();
    
    if (diferencaMs < 5000) {
      console.log(`✅ Data é recente (${diferencaMs}ms atrás)`);
    } else {
      console.log(`⚠️  Data não é recente (${diferencaMs}ms atrás)`);
      todosValidos = false;
    }
  } else {
    console.log('❌ Falha ao extrair data');
    todosValidos = false;
  }
  
  console.log();

  // Testa formatação para exibição
  console.log('🎨 Testando formatação para exibição...');
  console.log('-'.repeat(80));
  
  const nfceFormatado = formatIdForDisplay(nfceId);
  const pixFormatado = formatIdForDisplay(pixId);
  const pedidoFormatado = formatIdForDisplay(orderId);
  
  console.log(`NFC-e: ${nfceFormatado}`);
  console.log(`PIX: ${pixFormatado}`);
  console.log(`Pedido: ${pedidoFormatado}`);
  console.log();

  // Testa unicidade
  console.log('🔢 Testando unicidade...');
  console.log('-'.repeat(80));
  
  const id1 = generateNFCeReference();
  // Aguarda 2ms para garantir milissegundos diferentes
  await new Promise(resolve => setTimeout(resolve, 2));
  const id2 = generateNFCeReference();
  
  if (id1 !== id2) {
    console.log('✅ IDs são únicos');
  } else {
    console.log('❌ IDs duplicados detectados');
    todosValidos = false;
  }
  
  console.log();
  console.log('='.repeat(80));
  
  if (todosValidos) {
    console.log('✅ TODOS OS TESTES PASSARAM');
    console.log('='.repeat(80));
    process.exit(0);
  } else {
    console.log('❌ ALGUNS TESTES FALHARAM');
    console.log('='.repeat(80));
    process.exit(1);
  }
}

testarGeracaoIds();
