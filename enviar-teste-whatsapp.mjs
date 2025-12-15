/**
 * Script para gerar link de WhatsApp com mensagem de teste do DANFE
 */

// Dados de exemplo de uma NFC-e
const dadosNFCe = {
  numero: '000002',
  chaveAcesso: '35251114295537000130650010000000021000000265',
  urlDanfe: 'https://api.focusnfe.com.br/danfe/35251114295537000130650010000000021000000265.pdf',
  qrcodeUrl: 'https://www.sefaz.sp.gov.br/nfce/qrcode?p=35251114295537000130650010000000021000000265',
  valorTotal: 63.40,
  produtos: [
    {
      nome: 'Arroz Branco Tipo 1 - Kit 10un',
      quantidade: 1,
      valor: 23.50
    },
    {
      nome: 'Feijão Carioca Tipo 1 - Kit 10un',
      quantidade: 1,
      valor: 39.90
    }
  ]
};

// Gera mensagem formatada
function gerarMensagemDanfe(info) {
  const produtosTexto = info.produtos
    .map((p) => `• ${p.quantidade}x ${p.nome} - R$ ${p.valor.toFixed(2)}`)
    .join('\n');

  return `
🧾 *NOTA FISCAL ELETRÔNICA - BEM CASADO*

✅ Sua compra foi finalizada com sucesso!

📋 *Detalhes da Nota:*
• Número: ${info.numero}
• Chave de Acesso: ${info.chaveAcesso}

🛒 *Produtos:*
${produtosTexto}

💰 *Valor Total:* R$ ${info.valorTotal.toFixed(2)}

📄 *DANFE (Documento Auxiliar):*
${info.urlDanfe}

🔍 *Consultar Nota Fiscal:*
${info.qrcodeUrl}

---
*INDUSTRIA E COMERCIO DE ALIMENTOS BEM CASADO LTDA*
CNPJ: 14.295.537/0001-30
Fábrica de arroz - São José dos Campos/SP

📞 Contato: (12) 3197-2400
🕐 Horário: Sábados e Domingos, 7h às 13h

_Esta é uma mensagem de teste do sistema PDV._
`.trim();
}

// Gera link do WhatsApp
function gerarLinkWhatsApp(telefone, mensagem) {
  const telefoneNumeros = telefone.replace(/\D/g, '');
  const telefoneCompleto = telefoneNumeros.startsWith('55') 
    ? telefoneNumeros 
    : `55${telefoneNumeros}`;
  const mensagemCodificada = encodeURIComponent(mensagem);
  return `https://wa.me/${telefoneCompleto}?text=${mensagemCodificada}`;
}

// Número do usuário
const telefone = '12997452040';
const mensagem = gerarMensagemDanfe(dadosNFCe);
const linkWhatsApp = gerarLinkWhatsApp(telefone, mensagem);

console.log('═══════════════════════════════════════════════════════════');
console.log('📱 LINK DO WHATSAPP GERADO:');
console.log('═══════════════════════════════════════════════════════════\n');
console.log(linkWhatsApp);
console.log('\n═══════════════════════════════════════════════════════════');
console.log('✅ Copie e cole este link no navegador para abrir o WhatsApp');
console.log('   com a mensagem de teste do DANFE já pronta!');
console.log('═══════════════════════════════════════════════════════════\n');
