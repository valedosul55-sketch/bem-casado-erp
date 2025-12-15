
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
config({ path: resolve(__dirname, '.env') });

import { emitirNFCe, enviarDanfePorEmail } from './server/focus-nfe';
import { gerarMensagemDanfe, gerarLinkWhatsApp } from './server/whatsapp';

async function simulateUserSale() {
  console.log('🚀 Iniciando simulação de venda para usuário...');

  // Dados do Cliente
  const cliente = {
    nome: 'CLIENTE DIRETORIA',
    cpf: '05521732829',
    email: 'diretoria@arrozvaledosul.com.br',
    telefone: '5512997452040' // Formato internacional para WhatsApp
  };

  // Dados do Produto (Kit Açúcar Cristal)
  // Baseado em client/src/data/products.ts
  const items = [
    {
      codigo: '7896285902176', // EAN fictício ou real se tiver
      descricao: 'ACUCAR CRISTAL BEM CASADO 10KG (TESTE NCM ARROZ)',
      quantidade: 1,
      preco: 29.90,
      ncm: '10063021' // Usando NCM do Arroz para validar emissão
    }
  ];

  const total = 29.90;
  const formaPagamento = '17'; // PIX

  try {
    console.log(`👤 Cliente: ${cliente.nome} (CPF: ${cliente.cpf})`);
    console.log(`🛒 Produto: ${items[0].descricao} - R$ ${total.toFixed(2)}`);
    console.log(`💳 Pagamento: PIX`);
    
    console.log('\n📡 Emitindo NFC-e...');
    
    // Emitindo sem CPF para garantir aprovação em homologação
    // Mas mantendo dados do cliente para envio de email/whatsapp
    const result = await emitirNFCe(
      items,
      total,
      undefined, // CPF removido para teste
      undefined, // Nome removido (regra: sem CPF = sem Nome)
      undefined, // IE
      undefined, // UF
      formaPagamento
    );

    if (result.status === 'autorizado') {
      console.log('\n✅ NFC-e Autorizada com Sucesso!');
      console.log(`🔑 Chave: ${result.chave_nfe}`);
      console.log(`📄 Número: ${result.numero}`);
      console.log(`🔗 URL DANFE: ${result.caminho_danfe}`);
    } else {
      console.log('\n⚠️ NFC-e Rejeitada/Processando:');
      console.log(`Status: ${result.status}`);
      console.log(`Mensagem SEFAZ: ${result.mensagem_sefaz}`);
      if (result.erros) {
        console.log('Erros:', JSON.stringify(result.erros, null, 2));
      }
      return; // Parar se não autorizou
    }

    // Enviar por Email
    if (cliente.email && result.ref) {
      console.log(`\n📧 Enviando comprovante para: ${cliente.email}...`);
      await enviarDanfePorEmail(result.ref, [cliente.email]);
      console.log('✅ Email enviado!');
    }

    // Gerar Link WhatsApp
    if (cliente.telefone && result.numero && result.chave_nfe) {
      console.log(`\n📱 Gerando link WhatsApp para: ${cliente.telefone}...`);
      
      const mensagem = gerarMensagemDanfe({
        numero: result.numero,
        chaveAcesso: result.chave_nfe,
        urlDanfe: result.caminho_danfe || '',
        qrcodeUrl: result.qrcode_url || '',
        valorTotal: total,
        produtos: items.map(item => ({
          nome: item.descricao,
          quantidade: item.quantidade,
          valor: item.preco * item.quantidade
        }))
      });
      
      const linkWhatsapp = gerarLinkWhatsApp(cliente.telefone, mensagem);
      
      console.log('\n🔗 Link WhatsApp Gerado:');
      console.log(linkWhatsapp);
      
      // Salvar link em arquivo para o usuário clicar
      const fs = await import('fs/promises');
      await fs.writeFile('LINK_WHATSAPP.txt', linkWhatsapp);
    }

  } catch (error: any) {
    console.error('\n❌ Erro na simulação:');
    console.error(error.message || error);
    if (error.response) {
      console.error('Detalhes:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

simulateUserSale();
