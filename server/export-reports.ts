import ExcelJS from 'exceljs';
import type { NFCe } from '../drizzle/schema';

/**
 * Gera relatório de notas fiscais em Excel
 */
export async function gerarRelatorioExcel(
  notas: NFCe[],
  totalizadores: { valorTotal: number; quantidade: number }
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Notas Fiscais');

  // Configurar colunas
  worksheet.columns = [
    { header: 'Número', key: 'numero', width: 12 },
    { header: 'Série', key: 'serie', width: 8 },
    { header: 'Data Emissão', key: 'data', width: 18 },
    { header: 'Cliente', key: 'cliente', width: 30 },
    { header: 'CPF/CNPJ', key: 'documento', width: 18 },
    { header: 'Valor (R$)', key: 'valor', width: 15 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Chave de Acesso', key: 'chave', width: 50 },
  ];

  // Estilizar cabeçalho
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE2E8F0' },
  };

  // Adicionar dados
  notas.forEach((nota) => {
    const dataEmissao = nota.emitidaEm || nota.createdAt;
    worksheet.addRow({
      numero: nota.numero || '-',
      serie: nota.serie || '1',
      data: dataEmissao ? new Date(dataEmissao).toLocaleString('pt-BR') : '-',
      cliente: nota.clienteNome,
      documento: nota.clienteCpfCnpj || '-',
      valor: (nota.valorTotal / 100).toFixed(2),
      status: nota.status,
      chave: nota.chaveAcesso || '-',
    });
  });

  // Adicionar linha de totalizadores
  const totalRow = worksheet.addRow({
    numero: '',
    serie: '',
    data: '',
    cliente: '',
    documento: 'TOTAL:',
    valor: (totalizadores.valorTotal / 100).toFixed(2),
    status: `${totalizadores.quantidade} notas`,
    chave: '',
  });

  // Estilizar linha de total
  totalRow.font = { bold: true };
  totalRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF3F4F6' },
  };

  // Formatar coluna de valor como moeda
  worksheet.getColumn('valor').numFmt = '#,##0.00';

  // Gerar buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * Gera relatório de notas fiscais em PDF (HTML)
 */
export function gerarRelatorioPDF(
  notas: NFCe[],
  totalizadores: { valorTotal: number; quantidade: number }
): string {
  const formatarValor = (valor: number) => {
    return (valor / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatarData = (data: Date | string | null) => {
    if (!data) return '-';
    return new Date(data).toLocaleString('pt-BR');
  };

  const linhasTabela = notas
    .map(
      (nota) => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${nota.numero || '-'}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${nota.serie || '1'}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${formatarData(nota.emitidaEm || nota.createdAt)}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${nota.clienteNome}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${nota.clienteCpfCnpj || '-'}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatarValor(nota.valorTotal)}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${nota.status}</td>
    </tr>
  `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Relatório de Notas Fiscais</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
    }
    h1 {
      color: #333;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th {
      background-color: #f3f4f6;
      padding: 12px 8px;
      text-align: left;
      border: 1px solid #ddd;
      font-weight: bold;
    }
    .total-row {
      background-color: #f9fafb;
      font-weight: bold;
    }
    .footer {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 2px solid #333;
      font-size: 14px;
      color: #666;
    }
  </style>
</head>
<body>
  <h1>Relatório de Notas Fiscais (NFC-e)</h1>
  <p><strong>Data de Geração:</strong> ${new Date().toLocaleString('pt-BR')}</p>
  
  <table>
    <thead>
      <tr>
        <th>Número</th>
        <th>Série</th>
        <th>Data Emissão</th>
        <th>Cliente</th>
        <th>CPF/CNPJ</th>
        <th style="text-align: right;">Valor</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${linhasTabela}
      <tr class="total-row">
        <td colspan="5" style="padding: 12px 8px; border: 1px solid #ddd; text-align: right;">TOTAL:</td>
        <td style="padding: 12px 8px; border: 1px solid #ddd; text-align: right;">${formatarValor(totalizadores.valorTotal)}</td>
        <td style="padding: 12px 8px; border: 1px solid #ddd;">${totalizadores.quantidade} notas</td>
      </tr>
    </tbody>
  </table>
  
  <div class="footer">
    <p>Bem Casado Alimentos - Relatório gerado automaticamente</p>
  </div>
</body>
</html>
  `;
}
