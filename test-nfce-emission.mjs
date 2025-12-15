#!/usr/bin/env node
/**
 * Script de teste de emissão de NFC-e em homologação
 * Valida se o cadastro na SEFAZ-SP foi aprovado
 */

const FOCUS_NFE_TOKEN = process.env.FOCUS_NFE_TOKEN;
const FOCUS_NFE_BASE_URL = 'https://homologacao.focusnfe.com.br';

async function testarEmissaoNFCe() {
  console.log('🧪 Teste de Emissão de NFC-e - Homologação');
  console.log('==========================================\n');

  if (!FOCUS_NFE_TOKEN) {
    console.error('❌ FOCUS_NFE_TOKEN não configurado');
    process.exit(1);
  }

  // Gera referência única
  const referencia = `TEST_CADASTRO_${Date.now()}`;

  // Payload de teste com açúcar (CST 060)
  const payload = {
    natureza_operacao: 'Venda de mercadoria',
    data_emissao: new Date().toISOString(),
    tipo_documento: '1',
    finalidade_emissao: '1',
    cnpj_emitente: '14295537000130',
    inscricao_estadual_emitente: '645342314116',
    nome_emitente: 'INDUSTRIA E COMERCIO DE ALIMENTOS BEM CASADO LTDA',
    nome_fantasia_emitente: 'BEM CASADO ALIMENTOS',
    logradouro_emitente: 'ESTRADA MUNICIPAL SANTO ANTONIO DO ALTO',
    numero_emitente: '257',
    complemento_emitente: 'COND: CAPAO GROSSO II',
    bairro_emitente: 'PARQUE NOVO HORIZONTE',
    municipio_emitente: 'São José dos Campos',
    uf_emitente: 'SP',
    cep_emitente: '12225810',
    regime_tributario_emitente: '3', // 3=Regime Normal - Lucro Real
    consumidor_final: '1',
    presenca_comprador: '1',
    modalidade_frete: '9',
    itens: [
      {
        numero_item: '1',
        codigo_produto: 'ACUCAR_1KG',
        descricao: 'Açúcar Cristal Tipo 1 - Kit com 10 unidades de 1kg',
        cfop: '5405', // CFOP para mercadoria com ST
        codigo_ncm: '17019900',
        cest: '1710100',
        unidade_comercial: 'UN',
        quantidade_comercial: 1,
        valor_unitario_comercial: '29.90',
        valor_bruto: '29.90',
        icms_origem: '0',
        icms_situacao_tributaria: '60' // CST 060 - ICMS ST
      }
    ],
    formas_pagamento: [
      {
        forma_pagamento: '01',
        valor_pagamento: '29.90'
      }
    ]
  };

  console.log('📋 Dados da Emissão:');
  console.log(`   Referência: ${referencia}`);
  console.log(`   CNPJ: ${payload.cnpj_emitente}`);
  console.log(`   IE: ${payload.inscricao_estadual_emitente}`);
  console.log(`   Produto: Açúcar Cristal (CST 060)`);
  console.log(`   Valor: R$ 29,90\n`);

  try {
    console.log('⏳ Enviando requisição para Focus NFe...\n');

    const response = await fetch(
      `${FOCUS_NFE_BASE_URL}/v2/nfce?ref=${referencia}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${FOCUS_NFE_TOKEN}:`).toString('base64')}`
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    console.log('📊 Resposta da API:');
    console.log('==================\n');

    if (!response.ok) {
      console.log('❌ ERRO NA EMISSÃO\n');
      console.log(`Status HTTP: ${response.status}`);
      
      if (data.status_sefaz) {
        console.log(`Status SEFAZ: ${data.status_sefaz}`);
      }
      
      if (data.mensagem_sefaz) {
        console.log(`Mensagem SEFAZ: ${data.mensagem_sefaz}`);
      }
      
      if (data.erros && data.erros.length > 0) {
        console.log('\nErros:');
        data.erros.forEach((erro, idx) => {
          console.log(`  ${idx + 1}. [${erro.codigo}] ${erro.mensagem}`);
          if (erro.campo) {
            console.log(`     Campo: ${erro.campo}`);
          }
        });
      }

      console.log('\n📄 Resposta Completa:');
      console.log(JSON.stringify(data, null, 2));

      // Verifica se ainda é erro 245
      if (data.status_sefaz === '245') {
        console.log('\n⚠️  CNPJ ainda não está cadastrado na SEFAZ-SP (erro 245)');
        console.log('   O cadastro pode levar algumas horas para ser aprovado.');
        console.log('   Tente novamente mais tarde.');
      }

      process.exit(1);
    }

    // Verifica status
    console.log(`Status: ${data.status}\n`);

    if (data.status === 'erro_autorizacao') {
      console.log('⚠️  ERRO DE AUTORIZAÇÃO\n');
      
      if (data.status_sefaz) {
        console.log(`Status SEFAZ: ${data.status_sefaz}`);
      }
      
      if (data.mensagem_sefaz) {
        console.log(`Mensagem SEFAZ: ${data.mensagem_sefaz}`);
      }

      console.log('\n📄 Resposta Completa:');
      console.log(JSON.stringify(data, null, 2));
      
      process.exit(1);
    }

    if (data.status === 'processando') {
      console.log('⏳ NFC-e em processamento na SEFAZ\n');
      console.log('   Aguarde alguns segundos e consulte novamente.');
      console.log(`   Referência: ${referencia}`);
      process.exit(0);
    }

    // Sucesso!
    console.log('✅ NFC-e AUTORIZADA COM SUCESSO!\n');
    console.log(`Número: ${data.numero}`);
    console.log(`Série: ${data.serie}`);
    console.log(`Chave: ${data.chave_nfe}`);
    
    if (data.caminho_danfe) {
      console.log(`\n📄 DANFE: ${data.caminho_danfe}`);
    }
    
    if (data.qrcode_url) {
      console.log(`📱 QR Code: ${data.qrcode_url}`);
    }

    console.log('\n🎉 CADASTRO NA SEFAZ-SP APROVADO!');
    console.log('   O sistema está pronto para emitir NFC-e em homologação.');

  } catch (error) {
    console.error('\n❌ Erro na requisição:', error.message);
    process.exit(1);
  }
}

// Executa teste
testarEmissaoNFCe();
