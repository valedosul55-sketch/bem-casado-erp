import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function downloadDanfe() {
  const token = process.env.FOCUS_NFE_TOKEN;
  // URL direta para o PDF da DANFE (não HTML)
  // Formato: https://api.focusnfe.com.br/v2/nfce/{referencia}/danfe.pdf
  const referencia = 'VENDA_20251210_130324_674'; // Referência da Nota 1 Série 2
  
  console.log('Baixando DANFE...');
  
  const response = await fetch(
    `https://api.focusnfe.com.br/v2/nfce/${referencia}/danfe.pdf`, // Tenta pegar direto o PDF
    {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${token}:`).toString('base64')}`
      }
    }
  );

  if (!response.ok) {
    // Se falhar o PDF direto, tenta pegar a URL do retorno da consulta
    console.log('Tentativa direta falhou, consultando nota...');
    const respConsulta = await fetch(
      `https://api.focusnfe.com.br/v2/nfce/${referencia}`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${token}:`).toString('base64')}`
        }
      }
    );
    const dados = await respConsulta.json();
    console.log('Caminho DANFE:', dados.caminho_danfe);
    
    // O caminho_danfe geralmente é HTML, vamos tentar baixar ele se não tiver PDF
    if (dados.caminho_danfe) {
        const urlDanfe = `https://api.focusnfe.com.br${dados.caminho_danfe}`;
        console.log('Baixando de:', urlDanfe);
        // ... lógica para baixar HTML ...
        // Mas para entregar pro usuário, o ideal é o link ou print.
        // Vamos salvar o link num arquivo texto.
        fs.writeFileSync('link_danfe.txt', urlDanfe);
        return;
    }
  } else {
    const buffer = await response.arrayBuffer();
    fs.writeFileSync('danfe_nota_1_serie_2.pdf', Buffer.from(buffer));
    console.log('PDF salvo com sucesso: danfe_nota_1_serie_2.pdf');
  }
}

downloadDanfe();
