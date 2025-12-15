/**
 * Exemplos de uso do EmailService
 * 
 * Este arquivo demonstra como usar o EmailService e os templates
 * para enviar emails dos agentes.
 */

import { emailService } from '../services/emailService';
import { EmailTemplates, TaxLegislationReportData, ConsolidatedReportData } from '../templates/emailTemplates';

/**
 * Exemplo 1: Enviar relatório de legislação fiscal
 */
export async function sendTaxLegislationReportExample() {
  const reportData: TaxLegislationReportData = {
    date: new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    criticalAlerts: [
      {
        title: 'Certificado Digital vence em 15 dias',
        source: 'Sistema',
        publishedAt: new Date().toLocaleDateString('pt-BR'),
        deadline: '30/12/2024',
        description: 'O certificado digital A1 da empresa vence em 15 dias. Sem certificado válido, não será possível emitir NF-e.',
        impact: 'CRÍTICO - Operação pode parar completamente',
        action: 'Renovar certificado digital imediatamente junto à Autoridade Certificadora'
      }
    ],
    douPublications: [
      {
        title: 'Instrução Normativa RFB nº 2.200/2024',
        publishedAt: '13/12/2024',
        summary: 'Altera prazo de entrega do SPED Contribuições de 25 para 20 do mês seguinte.',
        impact: 'ALTO - Redução de 5 dias no prazo de entrega',
        action: 'Ajustar cronograma contábil e informar equipe',
        link: 'https://www.in.gov.br/exemplo'
      }
    ],
    opportunities: [
      {
        title: 'Redução de ICMS para cesta básica em SC',
        description: 'Convênio CONFAZ 123/2024 reduz ICMS de arroz e feijão de 12% para 7% em Santa Catarina.',
        savings: 'R$ 5.800/mês'
      }
    ],
    obligationsNext30Days: [
      {
        obligation: 'SPED Fiscal',
        period: 'Nov/2024',
        deadline: '20/12/2024',
        status: 'pending'
      },
      {
        obligation: 'SPED Contribuições',
        period: 'Nov/2024',
        deadline: '20/12/2024',
        status: 'pending'
      },
      {
        obligation: 'DCTF',
        period: 'Nov/2024',
        deadline: '15/12/2024',
        status: 'ok'
      }
    ]
  };
  
  const html = EmailTemplates.taxLegislationReport(reportData);
  
  const result = await emailService.sendTaxLegislationReport({
    to: 'diretoria@arrozbemcasado.com.br',
    cc: ['fiscal@arrozbemcasado.com.br'],
    html
  });
  
  console.log('Relatório de legislação fiscal enviado:', result);
  return result;
}

/**
 * Exemplo 2: Enviar relatório consolidado diário
 */
export async function sendConsolidatedDailyReportExample() {
  const reportData: ConsolidatedReportData = {
    date: new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    sales: {
      today: 45800.50,
      yesterday: 42300.00,
      change: 8.3
    },
    inventory: {
      lowStock: 3,
      outOfStock: 0
    },
    financial: {
      cashBalance: 125000.00,
      accountsReceivable: 89500.00,
      accountsPayable: 45200.00
    },
    production: {
      produced: 12500,
      target: 12000,
      efficiency: 104.2
    },
    highlights: [
      'Vendas 8,3% acima do dia anterior',
      'Meta de produção superada em 4,2%',
      'Fluxo de caixa positivo: R$ 125.000'
    ],
    alerts: [
      '3 produtos com estoque baixo (arroz integral, feijão preto, açúcar cristal)',
      'Certificado digital vence em 15 dias'
    ]
  };
  
  const html = EmailTemplates.consolidatedDailyReport(reportData);
  
  const result = await emailService.sendConsolidatedDailyReport({
    to: 'diretoria@arrozbemcasado.com.br',
    html
  });
  
  console.log('Relatório consolidado diário enviado:', result);
  return result;
}

/**
 * Exemplo 3: Enviar alerta crítico
 */
export async function sendCriticalAlertExample() {
  const html = EmailTemplates.criticalAlert({
    title: 'Certificado Digital Vencendo',
    description: 'O certificado digital A1 da empresa vence em 15 dias (30/12/2024). Sem certificado válido, não será possível emitir notas fiscais eletrônicas (NF-e).',
    impact: 'CRÍTICO - A operação comercial pode parar completamente. Todas as vendas dependem da emissão de NF-e.',
    action: 'Renovar o certificado digital imediatamente junto à Autoridade Certificadora. Processo leva de 2 a 5 dias úteis.',
    deadline: '30/12/2024'
  });
  
  const result = await emailService.sendCriticalAlert({
    to: 'diretoria@arrozbemcasado.com.br',
    cc: ['ti@arrozbemcasado.com.br', 'fiscal@arrozbemcasado.com.br'],
    subject: 'Certificado Digital Vencendo',
    html
  });
  
  console.log('Alerta crítico enviado:', result);
  return result;
}

/**
 * Função principal para testar todos os exemplos
 */
export async function testAllEmailExamples() {
  console.log('=== Testando envio de emails ===\n');
  
  console.log('1. Enviando relatório de legislação fiscal...');
  await sendTaxLegislationReportExample();
  console.log('✅ Concluído\n');
  
  console.log('2. Enviando relatório consolidado diário...');
  await sendConsolidatedDailyReportExample();
  console.log('✅ Concluído\n');
  
  console.log('3. Enviando alerta crítico...');
  await sendCriticalAlertExample();
  console.log('✅ Concluído\n');
  
  console.log('=== Todos os testes concluídos ===');
}

// Executar se chamado diretamente
if (require.main === module) {
  testAllEmailExamples()
    .then(() => {
      console.log('\n✅ Todos os emails foram enviados com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro ao enviar emails:', error);
      process.exit(1);
    });
}
