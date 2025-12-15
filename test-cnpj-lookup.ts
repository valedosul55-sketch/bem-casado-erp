/**
 * Script de teste para consulta de CNPJ
 * Testa a API de consulta com CNPJ real da Bem Casado
 */

import { consultarCNPJ } from './server/cnpj-lookup';

async function testarConsultaCNPJ() {
  console.log('='.repeat(80));
  console.log('TESTE DE CONSULTA DE CNPJ');
  console.log('='.repeat(80));
  console.log();

  // CNPJ da Bem Casado Alimentos
  const cnpjTeste = '14.295.537/0001-30';
  
  console.log(`📋 Testando consulta de CNPJ: ${cnpjTeste}`);
  console.log('-'.repeat(80));
  console.log();

  try {
    const resultado = await consultarCNPJ(cnpjTeste);

    if (!resultado) {
      console.log('❌ CNPJ não encontrado');
      console.log();
      console.log('='.repeat(80));
      process.exit(1);
    }

    console.log('✅ CNPJ encontrado com sucesso!');
    console.log();
    console.log('Dados retornados:');
    console.log('-'.repeat(80));
    console.log(`CNPJ: ${resultado.cnpj}`);
    console.log(`Razão Social: ${resultado.razaoSocial}`);
    console.log(`Nome Fantasia: ${resultado.nomeFantasia || '(não informado)'}`);
    console.log(`UF: ${resultado.uf}`);
    console.log(`Município: ${resultado.municipio || '(não informado)'}`);
    console.log(`Situação: ${resultado.situacao || '(não informado)'}`);
    
    if (resultado.inscricaoEstadual) {
      console.log(`Inscrição Estadual: ${resultado.inscricaoEstadual}`);
    }
    
    if (resultado.logradouro) {
      console.log(`Endereço: ${resultado.logradouro}, ${resultado.numero || 'S/N'}`);
      if (resultado.bairro) {
        console.log(`Bairro: ${resultado.bairro}`);
      }
      if (resultado.cep) {
        console.log(`CEP: ${resultado.cep}`);
      }
    }
    
    if (resultado.telefone) {
      console.log(`Telefone: ${resultado.telefone}`);
    }
    
    if (resultado.email) {
      console.log(`Email: ${resultado.email}`);
    }

    console.log();
    console.log('='.repeat(80));
    console.log();
    
    // Valida campos essenciais
    const camposEssenciais = {
      'Razão Social': resultado.razaoSocial,
      'UF': resultado.uf,
    };

    let todosPresentes = true;
    for (const [campo, valor] of Object.entries(camposEssenciais)) {
      if (!valor) {
        console.log(`⚠️  Campo obrigatório ausente: ${campo}`);
        todosPresentes = false;
      }
    }

    if (todosPresentes) {
      console.log('✅ Todos os campos essenciais estão presentes');
      console.log();
      console.log('='.repeat(80));
      process.exit(0);
    } else {
      console.log();
      console.log('='.repeat(80));
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Erro ao consultar CNPJ:', error);
    console.log();
    console.log('='.repeat(80));
    process.exit(1);
  }
}

testarConsultaCNPJ();
