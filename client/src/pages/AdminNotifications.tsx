import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Bell, CheckCircle, XCircle, RefreshCw, Send, FileDown, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminNotifications() {
  const [isTesting, setIsTesting] = useState(false);

  // Queries
  // @ts-ignore - Types will be regenerated
  const { data: logs, refetch, isLoading } = trpc.system.getAlertLogs.useQuery();
  
  // Mutations
  // @ts-ignore - Types will be regenerated
  const testAlertMutation = trpc.stock.testLowStockAlert.useMutation();

  // @ts-ignore - Types will be regenerated
  const { data: replenishmentReport } = trpc.stock.getReplenishmentReport.useQuery();

  // Gerar PDF de reposição (simulado com window.print por enquanto)
  const handlePrintReport = () => {
    const printContent = document.getElementById('replenishment-report');
    if (!printContent) return;
    
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // Recarrega para restaurar eventos React
  };

  // Testar envio de alerta
  const handleTestAlert = async () => {
    setIsTesting(true);
    try {
      await testAlertMutation.mutateAsync();
      toast.success('Alerta de teste enviado com sucesso!', {
        description: 'Verifique o email cadastrado na loja Matriz.',
      });
      // Aguardar um pouco para o log aparecer
      setTimeout(() => refetch(), 2000);
    } catch (error) {
      toast.error('Erro ao enviar alerta de teste', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Histórico de Notificações</h2>
          <p className="text-muted-foreground">
            Logs de alertas enviados pelo sistema (email e notificações internas).
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button onClick={handleTestAlert} disabled={isTesting}>
            <Send className="w-4 h-4 mr-2" />
            {isTesting ? 'Enviando...' : 'Testar Envio de Email'}
          </Button>
        </div>
      </div>

      {/* Relatório de Reposição */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Relatório de Reposição</CardTitle>
            <CardDescription>
              Produtos que precisam ser comprados (Estoque Atual &lt; Mínimo).
            </CardDescription>
          </div>
          <Button variant="outline" onClick={handlePrintReport} disabled={!replenishmentReport?.length}>
            <FileDown className="w-4 h-4 mr-2" />
            Imprimir Pedido
          </Button>
        </CardHeader>
        <CardContent>
          <div id="replenishment-report">
            <div className="hidden print:block mb-8">
              <h1 className="text-2xl font-bold">Pedido de Reposição de Estoque</h1>
              <p className="text-gray-500">Gerado em: {format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loja</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Atual</TableHead>
                  <TableHead className="text-right">Mínimo</TableHead>
                  <TableHead className="text-right font-bold">A Comprar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {replenishmentReport?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      Tudo certo! Nenhum produto precisa de reposição no momento.
                    </TableCell>
                  </TableRow>
                ) : (
                  replenishmentReport?.map((item: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.storeName}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{item.productName}</span>
                          <span className="text-xs text-muted-foreground">{item.brand}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-red-600 font-medium">
                        {item.currentStock} {item.unit}
                      </TableCell>
                      <TableCell className="text-right text-gray-500">
                        {item.minStock} {item.unit}
                      </TableCell>
                      <TableCell className="text-right font-bold bg-gray-50">
                        {item.toBuy} {item.unit}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Últimos Alertas Enviados</CardTitle>
          <CardDescription>
            Histórico dos últimos 100 alertas disparados pelo sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Destinatário</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum alerta registrado ainda.
                  </TableCell>
                </TableRow>
              ) : (
                logs?.map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {log.type === 'low_stock' ? 'Estoque Baixo' : log.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{log.title}</TableCell>
                    <TableCell>{log.recipientEmail || '-'}</TableCell>
                    <TableCell>
                      {log.status === 'sent' ? (
                        <Badge className="bg-green-500 hover:bg-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" /> Enviado
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" /> Falha
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
