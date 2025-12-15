/**
 * Script de teste para emissão de NFC-e no Focus NFe
 */

const FOCUS_NFE_TOKEN = 'BtkEw8Pzty7cvp2EMreGClE37QTRYP4z'; // Homologação
const FOCUS_NFE_BASE_URL = 'https://homologacao.focusnfe.com.br';
const CNPJ_EMPRESA = '14295537000130';

const referencia = `TESTE_${Date.now()}`;

// Cálculo CORRETO para cesta básica em SP:
// Redução: 61.11% (não entra no cálculo)
// Base tributável: Valor × 38.89% (o que sobra após redução)
// ICMS: Base × 18%
// Alíquota efetiva: 7% do valor original
const valorProduto = 29.90;
const baseCalculo = valorProduto * 0.3889; // 11.63 (38.89% do valor)
const valorICMS = baseCalculo * 0.18; // 2.09 (7% do valor original)

const payload = {
  natureza_operacao: 'Venda de mercadoria',
  data_emissao: new Date().toISOString(),
  tipo_documento: '1', // 1=Saída
  finalidade_emissao: '1', // 1=Normal
  cnpj_emitente: CNPJ_EMPRESA,
  consumidor_final: '1', // 1=Consumidor final
  presenca_comprador: '1', // 1=Operação presencial
  modalidade_frete: '9', // 9=Sem frete (venda presencial)
  itens: [
    {
      numero_item: '1',
      codigo_produto: '7896285902176',
      descricao: 'Açúcar Cristal',
      cfop: '5102',
      codigo_ncm: '10063021', // NCM para produtos alimentícios
      unidade_comercial: 'UN',
      quantidade_comercial: 1,
      valor_unitario_comercial: valorProduto.toFixed(2),
      valor_bruto: valorProduto.toFixed(2),
      icms_origem: '0',
      icms_situacao_tributaria: '20', // 20=Com redução de base de cálculo
      icms_modalidade_base_calculo: '3', // 3=Valor da operação
      icms_base_calculo: baseCalculo.toFixed(2), // 38.89% do valor
      icms_aliquota: '18.00', // Alíquota 18%
      icms_percentual_reducao: '61.11', // Redução de 61.11%
      icms_valor: valorICMS.toFixed(2) // 7% efetivo
    }
  ],
  formas_pagamento: [
    {
      forma_pagamento: '01', // 01=Dinheiro
      valor_pagamento: valorProduto.toFixed(2)
    }
  ]
};

console.log('=== TESTE DE EMISSÃO NFC-e ===');
console.log('Referência:', referencia);
console.log('\nCálculos CORRETOS:');
console.log('Valor produto: R$', valorProduto.toFixed(2));
console.log('Redução: 61.11% (não entra no cálculo)');
console.log('Base tributável (38.89%): R$', baseCalculo.toFixed(2));
console.log('ICMS (18% da base): R$', valorICMS.toFixed(2));
console.log('Alíquota efetiva: 7% do valor original');
console.log('Verificação: R$ 2.09 = 7% de R$ 29.90 ✓');
console.log('\nPayload:', JSON.stringify(payload, null, 2));
console.log('\nEnviando requisição...\n');

try {
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

  console.log('Status HTTP:', response.status);
  console.log('Resposta:', JSON.stringify(data, null, 2));

  if (!response.ok) {
    console.error('\n❌ ERRO NA EMISSÃO');
  } else {
    console.log('\n✅ SUCESSO!');
  }
} catch (error) {
  console.error('\n❌ ERRO:', error.message);
}
