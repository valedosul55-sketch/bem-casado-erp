/**
 * Script de teste para demonstrar envio de DANFE por WhatsApp
 */

// Simula dados de uma NFC-e emitida
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

// Testa com número de exemplo
const telefone = '12991234567';
const mensagem = gerarMensagemDanfe(dadosNFCe);
const linkWhatsApp = gerarLinkWhatsApp(telefone, mensagem);

console.log('═══════════════════════════════════════════════════════════');
console.log('📱 TESTE DE ENVIO DE DANFE POR WHATSAPP');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('📞 Telefone do cliente:', telefone);
console.log('');

console.log('💬 MENSAGEM QUE SERIA ENVIADA:');
console.log('───────────────────────────────────────────────────────────');
console.log(mensagem);
console.log('───────────────────────────────────────────────────────────\n');

console.log('🔗 LINK DO WHATSAPP:');
console.log(linkWhatsApp);
console.log('');

console.log('═══════════════════════════════════════════════════════════');
console.log('✅ COMO FUNCIONA NO PDV:');
console.log('═══════════════════════════════════════════════════════════');
console.log('1. Operador adiciona produtos ao carrinho');
console.log('2. Operador informa WhatsApp do cliente (opcional)');
console.log('3. Operador clica em "Finalizar Venda"');
console.log('4. Sistema emite NFC-e no Focus NFe');
console.log('5. Sistema gera link do WhatsApp com mensagem formatada');
console.log('6. Sistema abre WhatsApp automaticamente');
console.log('7. Operador só precisa clicar em "Enviar" no WhatsApp');
console.log('8. Cliente recebe DANFE completo com link do PDF e QR Code');
console.log('═══════════════════════════════════════════════════════════\n');
