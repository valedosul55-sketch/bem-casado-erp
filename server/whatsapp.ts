/**
 * Módulo de envio de DANFE por WhatsApp
 */

interface DanfeInfo {
  numero: string;
  chaveAcesso: string;
  urlDanfe: string;
  qrcodeUrl: string;
  valorTotal: number;
  produtos: Array<{
    nome: string;
    quantidade: number;
    valor: number;
  }>;
}

/**
 * Gera mensagem formatada do DANFE para WhatsApp
 */
export function gerarMensagemDanfe(info: DanfeInfo): string {
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

/**
 * Gera link do WhatsApp com mensagem pré-formatada
 */
export function gerarLinkWhatsApp(telefone: string, mensagem: string): string {
  // Remove caracteres não numéricos do telefone
  const telefoneNumeros = telefone.replace(/\D/g, '');
  
  // Adiciona código do país se não tiver
  const telefoneCompleto = telefoneNumeros.startsWith('55') 
    ? telefoneNumeros 
    : `55${telefoneNumeros}`;
  
  // Codifica mensagem para URL
  const mensagemCodificada = encodeURIComponent(mensagem);
  
  // Retorna link do WhatsApp
  return `https://wa.me/${telefoneCompleto}?text=${mensagemCodificada}`;
}

/**
 * Envia DANFE por WhatsApp (abre link no navegador)
 */
export function enviarDanfePorWhatsApp(telefone: string, info: DanfeInfo): string {
  const mensagem = gerarMensagemDanfe(info);
  return gerarLinkWhatsApp(telefone, mensagem);
}
