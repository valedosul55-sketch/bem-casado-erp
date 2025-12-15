/**
 * Script de teste para validar lógica de tributação diferenciada
 * Testa os 4 cenários:
 * 1. CNPJ + IE → CST 020 (base reduzida 7%)
 * 2. CNPJ sem IE → CST 040 (isento)
 * 3. CPF → CST 040 (isento)
 * 4. Sem documento → CST 040 (isento)
 */

interface TestItem {
  codigo: string;
  descricao: string;
  quantidade: number;
  preco: number;
  ncm: string;
}

interface TestCase {
  nome: string;
  cpfCnpj?: string;
  inscricaoEstadual?: string;
  expectedCST: string;
  expectedICMS: number; // Percentual esperado
}

const testCases: TestCase[] = [
  {
    nome: 'CNPJ + IE (Contribuinte)',
    cpfCnpj: '14295537000130', // 14 dígitos = CNPJ
    inscricaoEstadual: '645342314116',
    expectedCST: '20', // Base reduzida
    expectedICMS: 7.0, // 7% efetivo
  },
  {
    nome: 'CNPJ sem IE',
    cpfCnpj: '14295537000130',
    inscricaoEstadual: undefined,
    expectedCST: '40', // Isento
    expectedICMS: 0,
  },
  {
    nome: 'CPF',
    cpfCnpj: '12345678901', // 11 dígitos = CPF
    inscricaoEstadual: undefined,
    expectedCST: '40', // Isento
    expectedICMS: 0,
  },
  {
    nome: 'Sem documento',
    cpfCnpj: undefined,
    inscricaoEstadual: undefined,
    expectedCST: '40', // Isento
    expectedICMS: 0,
  },
];

function calcularTributacao(
  item: TestItem,
  cpfCnpj?: string,
  inscricaoEstadual?: string
) {
  const ncm = item.ncm || '10063021';
  const isAcucar = ncm === '17019900';
  const isArrozOuFeijao = ncm === '10063021' || ncm === '07133399';
  
  // Açúcar: CST 060 (ICMS ST já recolhido)
  if (isAcucar) {
    return {
      cst: '60',
      icmsPercentual: 0,
      icmsValor: 0,
      baseCalculo: 0,
    };
  }
  
  // Arroz/Feijão: Determina tributação baseado em Inscrição Estadual
  const isCnpj = cpfCnpj && cpfCnpj.length === 14;
  const temInscricaoEstadual = !!inscricaoEstadual && inscricaoEstadual.toUpperCase() !== 'ISENTO';
  const isContribuinte = isCnpj && temInscricaoEstadual;
  const isIsento = isArrozOuFeijao && !isContribuinte;
  
  const valorBruto = item.quantidade * item.preco;
  
  if (isIsento) {
    return {
      cst: '40',
      icmsPercentual: 0,
      icmsValor: 0,
      baseCalculo: 0,
    };
  } else {
    // Base reduzida (7% efetivo)
    const baseCalculo = valorBruto * 0.3889; // Base tributável 38.89%
    const icmsValor = baseCalculo * 0.18; // Alíquota ICMS 18%
    const icmsPercentual = (icmsValor / valorBruto) * 100; // Percentual efetivo
    
    return {
      cst: '20',
      icmsPercentual: Math.round(icmsPercentual * 100) / 100,
      icmsValor: Math.round(icmsValor * 100) / 100,
      baseCalculo: Math.round(baseCalculo * 100) / 100,
    };
  }
}

// Item de teste: Arroz Branco 10kg
const itemTeste: TestItem = {
  codigo: 'ARROZ_BRANCO',
  descricao: 'Arroz Branco Bem Casado 10kg',
  quantidade: 1,
  preco: 70.00,
  ncm: '10063021',
};

console.log('='.repeat(80));
console.log('TESTE DE TRIBUTAÇÃO DIFERENCIADA');
console.log('='.repeat(80));
console.log();
console.log('Produto:', itemTeste.descricao);
console.log('Valor:', `R$ ${itemTeste.preco.toFixed(2)}`);
console.log('NCM:', itemTeste.ncm);
console.log();
console.log('='.repeat(80));
console.log();

let allPassed = true;

for (const testCase of testCases) {
  console.log(`📋 Teste: ${testCase.nome}`);
  console.log('-'.repeat(80));
  
  if (testCase.cpfCnpj) {
    console.log(`   CPF/CNPJ: ${testCase.cpfCnpj} (${testCase.cpfCnpj.length} dígitos)`);
  } else {
    console.log(`   CPF/CNPJ: (não informado)`);
  }
  
  if (testCase.inscricaoEstadual) {
    console.log(`   IE: ${testCase.inscricaoEstadual}`);
  } else {
    console.log(`   IE: (não informado)`);
  }
  
  const resultado = calcularTributacao(
    itemTeste,
    testCase.cpfCnpj,
    testCase.inscricaoEstadual
  );
  
  const cstPassed = resultado.cst === testCase.expectedCST;
  const icmsPassed = Math.abs(resultado.icmsPercentual - testCase.expectedICMS) < 0.1;
  const passed = cstPassed && icmsPassed;
  
  console.log();
  console.log(`   Esperado: CST ${testCase.expectedCST}, ICMS ${testCase.expectedICMS}%`);
  console.log(`   Obtido:   CST ${resultado.cst}, ICMS ${resultado.icmsPercentual}%`);
  
  if (resultado.cst === '20') {
    console.log(`   Base Cálculo: R$ ${resultado.baseCalculo.toFixed(2)}`);
    console.log(`   Valor ICMS: R$ ${resultado.icmsValor.toFixed(2)}`);
  }
  
  console.log();
  console.log(`   Status: ${passed ? '✅ PASSOU' : '❌ FALHOU'}`);
  
  if (!passed) {
    allPassed = false;
    if (!cstPassed) {
      console.log(`   ⚠️  CST incorreto: esperado ${testCase.expectedCST}, obtido ${resultado.cst}`);
    }
    if (!icmsPassed) {
      console.log(`   ⚠️  ICMS incorreto: esperado ${testCase.expectedICMS}%, obtido ${resultado.icmsPercentual}%`);
    }
  }
  
  console.log();
}

console.log('='.repeat(80));
console.log();
console.log(`Resultado Final: ${allPassed ? '✅ TODOS OS TESTES PASSARAM' : '❌ ALGUNS TESTES FALHARAM'}`);
console.log();
console.log('='.repeat(80));

process.exit(allPassed ? 0 : 1);
