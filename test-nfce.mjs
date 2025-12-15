/**
 * Script de teste para emissão de NFC-e via Focus NFe
 * Ambiente: Homologação
 */

const FOCUS_NFE_TOKEN = process.env.FOCUS_NFE_TOKEN;
const FOCUS_NFE_BASE_URL = 'https://homologacao.focusnfe.com.br';
const CNPJ_EMPRESA = process.env.CNPJ_EMPRESA;

console.log('🧪 Teste de Emissão de NFC-e - Ambiente de Homologação\n');
console.log('📋 Configurações:');
console.log(`   Token: ${FOCUS_NFE_TOKEN ? '✅ Configurado' : '❌ Não configurado'}`);
console.log(`   CNPJ: ${CNPJ_EMPRESA || '❌ Não configurado'}`);
console.log(`   URL: ${FOCUS_NFE_BASE_URL}\n`);

if (!FOCUS_NFE_TOKEN) {
  console.error('❌ FOCUS_NFE_TOKEN não configurado!');
  process.exit(1);
}

// Dados de teste
const referencia = `TEST_${Date.now()}`;
const payload = {
  natureza_operacao: 'Venda de mercadoria',
  data_emissao: new Date().toISOString(),
  tipo_documento: '1', // 1=NFC-e
  finalidade_emissao: '1', // 1=Normal
  cnpj_emitente: CNPJ_EMPRESA,
  consumidor_final: '1', // 1=Consumidor final
  presenca_comprador: '1', // 1=Operação presencial
  modalidade_frete: '9', // 9=Sem frete
  itens: [
    {
      numero_item: '1',
      codigo_produto: '7896005800034',
      descricao: 'Arroz Integral Tipo 1 - Kit 10un 1kg',
      cfop: '5102',
      codigo_ncm: '10063021', // Arroz
      unidade_comercial: 'UN',
      quantidade_comercial: 2,
      valor_unitario_comercial: '23.00',
      valor_bruto: '46.00',
      icms_origem: '0',
      icms_situacao_tributaria: '20',
      icms_modalidade_base_calculo: '3',
      icms_base_calculo: '17.89',
      icms_aliquota: '18.00',
      icms_percentual_reducao: '61.11',
      icms_valor: '3.22'
    },
    {
      numero_item: '2',
      codigo_produto: '7896005800041',
      descricao: 'Açúcar Cristal - Kit 10un 1kg',
      cfop: '5102',
      codigo_ncm: '17019900', // Açúcar Cristal (NCM correto)
      unidade_comercial: 'UN',
      quantidade_comercial: 2,
      valor_unitario_comercial: '29.00',
      valor_bruto: '58.00',
      icms_origem: '0',
      icms_situacao_tributaria: '20',
      icms_modalidade_base_calculo: '3',
      icms_base_calculo: '22.56',
      icms_aliquota: '18.00',
      icms_percentual_reducao: '61.11',
      icms_valor: '4.06'
    }
  ],
  formas_pagamento: [
    {
      forma_pagamento: '17', // 17=PIX
      valor_pagamento: '104.00'
    }
  ]
};

console.log('📦 Payload da NFC-e:');
console.log(JSON.stringify(payload, null, 2));
console.log('\n🚀 Enviando requisição para Focus NFe...\n');

try {
  const response = await fetch(
    `${FOCUS_NFE_BASE_URL}/v2/nfce?ref=${referencia}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(FOCUS_NFE_TOKEN + ':').toString('base64')}`
      },
      body: JSON.stringify(payload)
    }
  );

  const data = await response.json();

  console.log(`📊 Status HTTP: ${response.status}\n`);
  console.log('📄 Resposta do Focus NFe:');
  console.log(JSON.stringify(data, null, 2));
  console.log('\n');

  if (response.ok && data.status === 'autorizado') {
    console.log('✅ NFC-e AUTORIZADA COM SUCESSO!');
    console.log(`   Número: ${data.numero}`);
    console.log(`   Série: ${data.serie}`);
    console.log(`   Chave: ${data.chave_nfe}`);
    console.log(`   Status SEFAZ: ${data.status_sefaz}`);
    console.log(`   Mensagem: ${data.mensagem_sefaz}`);
    if (data.caminho_danfe) {
      console.log(`   DANFE: ${data.caminho_danfe}`);
    }
    if (data.qrcode_url) {
      console.log(`   QR Code: ${data.qrcode_url}`);
    }
  } else if (data.status === 'processando') {
    console.log('⏳ NFC-e em processamento...');
    console.log('   Aguarde alguns segundos e consulte novamente.');
  } else {
    console.log('❌ ERRO ao emitir NFC-e:');
    if (data.erros && data.erros.length > 0) {
      data.erros.forEach((erro, index) => {
        console.log(`   ${index + 1}. ${erro.mensagem} (Código: ${erro.codigo})`);
      });
    }
    if (data.mensagem_sefaz) {
      console.log(`   SEFAZ: ${data.mensagem_sefaz}`);
    }
  }

} catch (error) {
  console.error('❌ Erro na requisição:', error.message);
  process.exit(1);
}
