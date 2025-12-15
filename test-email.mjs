/**
 * Script de teste simples para envio de email via MCP Gmail
 * 
 * Uso: node test-email.mjs
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function testEmailSend() {
  console.log('🧪 Testando envio de email via MCP Gmail...\n');
  
  const emailData = {
    messages: [
      {
        to: ['diretoria@arrozbemcasado.com.br'],
        subject: '🧪 Teste de Integração - EmailService',
        content: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #c92a2a 0%, #862e9c 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background: #f8f9fa;
      padding: 30px;
      border-radius: 0 0 8px 8px;
    }
    .success {
      background: #d3f9d8;
      border-left: 4px solid #2b8a3e;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>✅ Teste de Integração</h1>
    <p>EmailService + MCP Gmail</p>
  </div>
  <div class="content">
    <h2>🎉 Email enviado com sucesso!</h2>
    
    <div class="success">
      <strong>✅ Integração funcionando perfeitamente!</strong><br/>
      O EmailService está configurado e pronto para uso pelos agentes do sistema.
    </div>
    
    <h3>📋 Informações do Teste</h3>
    <ul>
      <li><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</li>
      <li><strong>Serviço:</strong> EmailService</li>
      <li><strong>Provider:</strong> MCP Gmail</li>
      <li><strong>Status:</strong> ✅ Operacional</li>
    </ul>
    
    <h3>🤖 Próximos Passos</h3>
    <p>Agora você pode usar o EmailService nos agentes:</p>
    <ul>
      <li>⚖️ Agente de Legislação Fiscal</li>
      <li>📊 Agente de Relatórios Diários</li>
      <li>💰 Agente Financeiro</li>
      <li>💼 Agente de Contabilidade</li>
      <li>🏭 Agente de Produção</li>
      <li>📊 Agente Fiscal</li>
    </ul>
    
    <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 13px;">
      🤖 Sistema: ERP Bem Casado<br/>
      📧 Este é um email de teste automatizado
    </p>
  </div>
</body>
</html>
    `
      }
    ]
  };
  
  try {
    console.log('📧 Enviando email de teste...');
    console.log(`   Para: ${emailData.messages[0].to[0]}`);
    console.log(`   Assunto: ${emailData.messages[0].subject}\n`);
    
    const command = `manus-mcp-cli tool call gmail_send_messages --server gmail --input '${JSON.stringify(emailData)}'`;
    
    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: 10 * 1024 * 1024
    });
    
    if (stderr && !stderr.includes('Successfully called')) {
      throw new Error(stderr);
    }
    
    console.log('✅ Email enviado com sucesso!');
    console.log('\n📊 Resultado:');
    console.log(stdout);
    
    console.log('\n🎉 Teste concluído com sucesso!');
    console.log('\n📝 Próximos passos:');
    console.log('   1. Verificar a caixa de entrada de diretoria@arrozbemcasado.com.br');
    console.log('   2. Confirmar recebimento do email de teste');
    console.log('   3. Integrar EmailService nos agentes');
    
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error.message);
    console.error('\n🔧 Possíveis causas:');
    console.error('   1. MCP Gmail não está autenticado');
    console.error('   2. Servidor MCP não está rodando');
    console.error('   3. Permissões insuficientes');
    console.error('\n💡 Solução:');
    console.error('   Execute: manus-mcp-cli tool list --server gmail');
    console.error('   Para verificar se o servidor está configurado');
    
    process.exit(1);
  }
}

testEmailSend();
