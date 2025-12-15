/**
 * Script de teste para envio de email via Nodemailer
 * 
 * Uso: node test-email-nodemailer.mjs
 * 
 * Requisitos:
 * - SMTP_EMAIL_USER ou GMAIL_USER configurado no .env
 * - SMTP_EMAIL_PASS ou GMAIL_APP_PASSWORD configurado no .env
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Carregar .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

async function testEmailSend() {
  console.log('🧪 Testando envio de email via Nodemailer...\n');
  
  // Verificar credenciais
  const emailUser = process.env.SMTP_EMAIL_USER || process.env.GMAIL_USER;
  const emailPass = process.env.SMTP_EMAIL_PASS || process.env.GMAIL_APP_PASSWORD;
  
  if (!emailUser || !emailPass) {
    console.error('❌ Erro: Credenciais SMTP não configuradas!\n');
    console.error('📝 Configure no arquivo .env:');
    console.error('   SMTP_EMAIL_USER=seu-email@gmail.com');
    console.error('   SMTP_EMAIL_PASS=sua-senha-de-app\n');
    console.error('💡 Como gerar senha de app:');
    console.error('   1. Acesse: https://myaccount.google.com/apppasswords');
    console.error('   2. Crie uma senha para "Nodemailer"');
    console.error('   3. Copie a senha gerada (16 caracteres)');
    console.error('   4. Cole no .env como SMTP_EMAIL_PASS\n');
    process.exit(1);
  }
  
  console.log('✅ Credenciais encontradas');
  console.log(`   Email: ${emailUser}`);
  console.log(`   Senha: ${'*'.repeat(emailPass.length)}\n`);
  
  // Criar transporter
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
  
  // Email de teste
  const emailHtml = `
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
    .info {
      background: #e3f2fd;
      border-left: 4px solid #1971c2;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>✅ Teste de Integração</h1>
    <p>EmailService + Nodemailer</p>
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
      <li><strong>Provider:</strong> Nodemailer + Gmail SMTP</li>
      <li><strong>Status:</strong> ✅ Operacional</li>
    </ul>
    
    <div class="info">
      <strong>💡 Vantagens do Nodemailer:</strong><br/>
      • Funciona 24/7 automaticamente<br/>
      • Suporta HTML completo<br/>
      • Anexos funcionam<br/>
      • Produção-ready<br/>
      • Não depende de interação manual
    </div>
    
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
      📧 Este é um email de teste automatizado via Nodemailer
    </p>
  </div>
</body>
</html>
  `;
  
  try {
    console.log('📧 Enviando email de teste...');
    console.log(`   Para: diretoria@arrozbemcasado.com.br`);
    console.log(`   Assunto: 🧪 Teste de Integração - EmailService + Nodemailer\n`);
    
    const info = await transporter.sendMail({
      from: {
        name: 'Sistema ERP Bem Casado',
        address: emailUser,
      },
      to: 'diretoria@arrozbemcasado.com.br',
      subject: '🧪 Teste de Integração - EmailService + Nodemailer',
      html: emailHtml,
    });
    
    console.log('✅ Email enviado com sucesso!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}\n`);
    
    console.log('🎉 Teste concluído com sucesso!\n');
    console.log('📝 Próximos passos:');
    console.log('   1. Verificar a caixa de entrada de diretoria@arrozbemcasado.com.br');
    console.log('   2. Confirmar recebimento do email de teste');
    console.log('   3. Integrar EmailService nos agentes\n');
    
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error.message);
    console.error('\n🔧 Possíveis causas:');
    console.error('   1. Senha de app incorreta');
    console.error('   2. Conta Gmail sem autenticação de 2 fatores');
    console.error('   3. "Acesso a apps menos seguros" desabilitado');
    console.error('\n💡 Solução:');
    console.error('   1. Habilite autenticação de 2 fatores no Gmail');
    console.error('   2. Gere uma senha de app em: https://myaccount.google.com/apppasswords');
    console.error('   3. Use a senha de app (16 caracteres) no .env\n');
    
    process.exit(1);
  }
}

testEmailSend();
