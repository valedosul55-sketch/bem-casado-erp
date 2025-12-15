import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Search, FileText, Download, Copy, ChevronLeft, ChevronRight, Receipt, DollarSign, CheckCircle2, Ban, AlertTriangle, Mail, MessageCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Link } from 'wouter';

export default function AdminNFCe() {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [status, setStatus] = useState<'processando' | 'autorizada' | 'cancelada' | 'denegada' | 'erro' | 'all'>('all');
  const [busca, setBusca] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const limite = 20;

  // Estados para cancelamento
  const [notaCancelar, setNotaCancelar] = useState<any>(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Estados para exportação
  const [exportandoExcel, setExportandoExcel] = useState(false);
  const [exportandoPDF, setExportandoPDF] = useState(false);

  // Estados para reemissão de DANFE
  const [notaReenviar, setNotaReenviar] = useState<any>(null);
  const [emailDestinatario, setEmailDestinatario] = useState('');
  const [showEmailDialog, setShowEmailDialog] = useState(false);

  // Query para listar NFC-e
  // @ts-ignore - Types will be regenerated
  const { data, isLoading, refetch } = trpc.nfce.listar.useQuery({
    dataInicio: dataInicio || undefined,
    dataFim: dataFim || undefined,
    status: status === 'all' ? undefined : status,
    busca: busca || undefined,
    pagina: paginaAtual,
    limite,
  });

  // Mutation para cancelar NFC-e
  // @ts-ignore - Types will be regenerated
  const cancelarMutation = trpc.nfce.cancelar.useMutation({
    onSuccess: () => {
      toast.success('NFC-e cancelada com sucesso!');
      setShowCancelDialog(false);
      setMotivoCancelamento('');
      setNotaCancelar(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao cancelar NFC-e');
    },
  });



  const notas = data?.notas || [];
  const paginacao = data?.paginacao || { paginaAtual: 1, totalPaginas: 1, totalRegistros: 0 };
  const totalizadores = data?.totalizadores || { valorTotal: 0, quantidade: 0 };

  // Função para copiar chave de acesso
  const copiarChave = (chave: string) => {
    navigator.clipboard.writeText(chave);
    toast.success('Chave de acesso copiada!');
  };

  // Função para formatar data
  const formatarData = (data: Date | string | null) => {
    if (!data) return '-';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  // Função para formatar valor
  const formatarValor = (valor: number) => {
    return (valor / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Função para obter cor do badge de status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'autorizada':
        return 'bg-green-500';
      case 'cancelada':
        return 'bg-red-500';
      case 'processando':
        return 'bg-yellow-500';
      case 'denegada':
        return 'bg-orange-500';
      case 'erro':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Limpar filtros
  const limparFiltros = () => {
    setDataInicio('');
    setDataFim('');
    setStatus('all');
    setBusca('');
    setPaginaAtual(1);
  };

  // Função para abrir modal de reenvio de email
  const abrirReenvioEmail = (nota: any) => {
    setNotaReenviar(nota);
    setEmailDestinatario(nota.clienteEmail || '');
    setShowEmailDialog(true);
  };

  // Mutation para reenviar DANFE por email
  // @ts-ignore - Types will be regenerated
  const reenviarEmailMutation = trpc.nfce.reenviarEmail.useMutation({
    onSuccess: () => {
      toast.success('DANFE enviado com sucesso!');
      setShowEmailDialog(false);
      setEmailDestinatario('');
      setNotaReenviar(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao enviar DANFE');
    },
  });

  // Função para reenviar DANFE por email
  const reenviarEmail = async () => {
    if (!notaReenviar || !emailDestinatario) {
      toast.error('Informe um email válido');
      return;
    }

    reenviarEmailMutation.mutate({
      referencia: notaReenviar.referencia,
      email: emailDestinatario,
    });
  };

  // Função para compartilhar DANFE via WhatsApp
  const compartilharWhatsApp = (nota: any) => {
    if (!nota.urlDanfe || !nota.chaveAcesso) {
      toast.error('Nota fiscal sem DANFE disponível');
      return;
    }

    const mensagem = `*DANFE - Nota Fiscal Eletrônica*\n\n` +
      `Número: ${nota.numero}\n` +
      `Série: ${nota.serie}\n` +
      `Valor: ${formatarValor(nota.valorTotal)}\n\n` +
      `Chave de Acesso:\n${nota.chaveAcesso}\n\n` +
      `Visualizar DANFE:\n${nota.urlDanfe}\n\n` +
      `${nota.qrcodeUrl ? `QR Code:\n${nota.qrcodeUrl}` : ''}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
    window.open(whatsappUrl, '_blank');
    toast.success('WhatsApp aberto com mensagem pronta!');
  };

  // Abrir diálogo de cancelamento
  const abrirCancelamento = (nota: any) => {
    setNotaCancelar(nota);
    setMotivoCancelamento('');
    setShowCancelDialog(true);
  };

  // Confirmar cancelamento
  const confirmarCancelamento = () => {
    if (!notaCancelar) return;
    
    if (motivoCancelamento.length < 15) {
      toast.error('Motivo deve ter no mínimo 15 caracteres');
      return;
    }

    cancelarMutation.mutate({
      id: notaCancelar.id,
      motivo: motivoCancelamento,
    });
  };

  // Verificar se pode cancelar (24 horas)
  const podeCancelar = (nota: any) => {
    if (nota.status !== 'autorizada') return false;
    
    const emitidaEm = nota.emitidaEm || nota.createdAt;
    const horasDesdeEmissao = (Date.now() - new Date(emitidaEm).getTime()) / (1000 * 60 * 60);
    
    return horasDesdeEmissao <= 24;
  };

  // Exportar para Excel
  const exportarExcel = async () => {
    setExportandoExcel(true);
    try {
      // @ts-ignore
      const resultado = await trpc.nfce.exportarExcel.mutate({
        dataInicio: dataInicio || undefined,
        dataFim: dataFim || undefined,
        status: status === 'all' ? undefined : status,
        busca: busca || undefined,
      });

      if (resultado.success) {
        // Converter base64 para blob e fazer download
        const byteCharacters = atob(resultado.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = resultado.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('Relatório Excel gerado com sucesso!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao gerar relatório Excel');
    } finally {
      setExportandoExcel(false);
    }
  };

  // Exportar para PDF
  const exportarPDF = async () => {
    setExportandoPDF(true);
    try {
      // @ts-ignore
      const resultado = await trpc.nfce.exportarPDF.mutate({
        dataInicio: dataInicio || undefined,
        dataFim: dataFim || undefined,
        status: status === 'all' ? undefined : status,
        busca: busca || undefined,
      });

      if (resultado.success) {
        // Abrir HTML em nova janela para imprimir como PDF
        const novaJanela = window.open('', '_blank');
        if (novaJanela) {
          novaJanela.document.write(resultado.html);
          novaJanela.document.close();
          toast.success('Relatório PDF aberto em nova aba!');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao gerar relatório PDF');
    } finally {
      setExportandoPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notas Fiscais (NFC-e)</h1>
            <p className="text-muted-foreground mt-1">
              Histórico completo de notas fiscais emitidas
            </p>
          </div>
          <Link href="/admin">
            <Button variant="outline">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Notas</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalizadores.quantidade}</div>
              <p className="text-xs text-muted-foreground">
                {paginacao.totalRegistros} no total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatarValor(totalizadores.valorTotal)}</div>
              <p className="text-xs text-muted-foreground">
                Faturamento total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalizadores.quantidade > 0 
                  ? formatarValor(Math.round(totalizadores.valorTotal / totalizadores.quantidade))
                  : 'R$ 0,00'}
              </div>
              <p className="text-xs text-muted-foreground">
                Valor médio por nota
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Filtre as notas fiscais por data, status ou cliente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataInicio">Data Início</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataFim">Data Fim</Label>
                <Input
                  id="dataFim"
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="autorizada">Autorizada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                    <SelectItem value="processando">Processando</SelectItem>
                    <SelectItem value="denegada">Denegada</SelectItem>
                    <SelectItem value="erro">Erro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="busca">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="busca"
                    placeholder="Número, chave, cliente..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="flex items-end gap-2">
                <Button onClick={() => refetch()} className="flex-1">
                  Filtrar
                </Button>
                <Button onClick={limparFiltros} variant="outline">
                  Limpar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Notas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Notas Fiscais</CardTitle>
                <CardDescription>
                  Mostrando {notas.length} de {paginacao.totalRegistros} notas
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportarExcel}
                  disabled={exportandoExcel}
                >
                  <Download className="w-4 h-4 mr-1" />
                  {exportandoExcel ? 'Gerando...' : 'Excel'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportarPDF}
                  disabled={exportandoPDF}
                >
                  <FileText className="w-4 h-4 mr-1" />
                  {exportandoPDF ? 'Gerando...' : 'PDF'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando...
              </div>
            ) : notas.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma nota fiscal encontrada
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Número</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>CPF/CNPJ</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Chave de Acesso</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notas.map((nota: any) => (
                        <TableRow key={nota.id}>
                          <TableCell className="font-medium">
                            {nota.numero || '-'}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {formatarData(nota.emitidaEm || nota.createdAt)}
                          </TableCell>
                          <TableCell>{nota.clienteNome}</TableCell>
                          <TableCell>{nota.clienteCpfCnpj || '-'}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatarValor(nota.valorTotal)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(nota.status)}>
                              {nota.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {nota.chaveAcesso ? (
                              <div className="flex items-center gap-2">
                                <span className="truncate max-w-[120px]">
                                  {nota.chaveAcesso}
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copiarChave(nota.chaveAcesso)}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {nota.urlDanfe && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(nota.urlDanfe, '_blank')}
                                >
                                  <FileText className="w-4 h-4 mr-1" />
                                  DANFE
                                </Button>
                              )}
                              {nota.chaveAcesso && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    // TODO: Implementar download de XML
                                    toast.info('Download de XML em breve');
                                  }}
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              )}
                              {nota.status === 'autorizada' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => abrirReenvioEmail(nota)}
                                    title="Reenviar DANFE por email"
                                  >
                                    <Mail className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => compartilharWhatsApp(nota)}
                                    title="Compartilhar DANFE via WhatsApp"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              {podeCancelar(nota) && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => abrirCancelamento(nota)}
                                >
                                  <Ban className="w-4 h-4 mr-1" />
                                  Cancelar
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginação */}
                {paginacao.totalPaginas > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Página {paginacao.paginaAtual} de {paginacao.totalPaginas}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
                        disabled={paginacao.paginaAtual === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPaginaAtual(p => Math.min(paginacao.totalPaginas, p + 1))}
                        disabled={paginacao.paginaAtual === paginacao.totalPaginas}
                      >
                        Próxima
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Reenvio de Email */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reenviar DANFE por Email</DialogTitle>
            <DialogDescription>
              Informe o email do destinatário para reenviar o DANFE da nota fiscal.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email do Destinatário *</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                value={emailDestinatario}
                onChange={(e) => setEmailDestinatario(e.target.value)}
              />
            </div>

            {notaReenviar && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Nota Fiscal:</strong> {notaReenviar.numero} - Série {notaReenviar.serie}<br />
                  <strong>Cliente:</strong> {notaReenviar.clienteNome}<br />
                  <strong>Valor:</strong> {formatarValor(notaReenviar.valorTotal)}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEmailDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={reenviarEmail}
              disabled={!emailDestinatario || reenviarEmailMutation.isPending}
            >
              <Mail className="w-4 h-4 mr-2" />
              {reenviarEmailMutation.isPending ? 'Enviando...' : 'Enviar Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Cancelamento */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Cancelar NFC-e
            </DialogTitle>
            <DialogDescription>
              Você está prestes a cancelar a nota fiscal <strong>{notaCancelar?.numero}</strong>.
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm text-orange-800">
                ⚠️ <strong>Atenção:</strong> O cancelamento é válido apenas até 24 horas após a emissão.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo do Cancelamento *</Label>
              <Textarea
                id="motivo"
                placeholder="Digite o motivo do cancelamento (mínimo 15 caracteres)..."
                value={motivoCancelamento}
                onChange={(e) => setMotivoCancelamento(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {motivoCancelamento.length}/15 caracteres mínimos
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={cancelarMutation.isPending}
            >
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmarCancelamento}
              disabled={cancelarMutation.isPending || motivoCancelamento.length < 15}
            >
              {cancelarMutation.isPending ? 'Cancelando...' : 'Confirmar Cancelamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
