import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  FileText,
  Download,
  Send,
  ExternalLink,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function GestaoNFCe() {
  const [notaSelecionada, setNotaSelecionada] = useState<any>(null);
  const [telefoneReenvio, setTelefoneReenvio] = useState("");
  const [dialogReenvioAberto, setDialogReenvioAberto] = useState(false);

  // @ts-ignore
  const { data: notas, refetch } = trpc.nfce.listar.useQuery({ limite: 100 });
  // @ts-ignore
  const { data: estatisticas } = trpc.nfce.estatisticas.useQuery({});
  // @ts-ignore
  const reenviarWhatsAppMutation = trpc.nfce.reenviarWhatsApp.useMutation();

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: any; icon: any }> = {
      autorizada: { label: "Autorizada", variant: "default", icon: CheckCircle },
      cancelada: { label: "Cancelada", variant: "destructive", icon: XCircle },
      processando: { label: "Processando", variant: "secondary", icon: Clock },
      erro: { label: "Erro", variant: "destructive", icon: XCircle },
      denegada: { label: "Denegada", variant: "destructive", icon: XCircle },
    };

    const config = statusMap[status] || statusMap.processando;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const handleReenviarWhatsApp = (nota: any) => {
    setNotaSelecionada(nota);
    setTelefoneReenvio(nota.clienteTelefone || "");
    setDialogReenvioAberto(true);
  };

  const confirmarReenvio = async () => {
    if (!notaSelecionada || !telefoneReenvio) {
      toast.error("Informe o número do WhatsApp");
      return;
    }

    try {
      const result = await reenviarWhatsAppMutation.mutateAsync({
        id: notaSelecionada.id,
        telefone: telefoneReenvio,
      });

      if (result.success && result.whatsappLink) {
        window.open(result.whatsappLink, "_blank");
        toast.success("WhatsApp aberto! Clique em Enviar para o cliente.");
        setDialogReenvioAberto(false);
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao gerar link do WhatsApp");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Gestão de Notas Fiscais (NFC-e)
          </h1>
          <p className="text-gray-600 mt-1">
            Consulte, gerencie e reimprima notas fiscais emitidas
          </p>
        </div>

        {/* Estatísticas */}
        {estatisticas && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total de Notas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estatisticas.totalNotas}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Autorizadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {estatisticas.notasAutorizadas}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Canceladas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {estatisticas.notasCanceladas}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Faturamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  R$ {(estatisticas.faturamentoTotal / 100).toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lista de Notas */}
        <Card>
          <CardHeader>
            <CardTitle>Notas Fiscais Emitidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notas && notas.length > 0 ? (
                notas.map((nota: any) => (
                  <div
                    key={nota.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg">
                            NFC-e {nota.numero || "Processando"}
                          </h3>
                          {getStatusBadge(nota.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Cliente:</span>{" "}
                            {nota.clienteNome}
                          </div>
                          {nota.clienteCpfCnpj && (
                            <div>
                              <span className="font-medium">CPF/CNPJ:</span>{" "}
                              {nota.clienteCpfCnpj}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Valor:</span> R${" "}
                            {(nota.valorTotal / 100).toFixed(2)}
                          </div>
                          <div>
                            <span className="font-medium">Data:</span>{" "}
                            {new Date(nota.createdAt).toLocaleString("pt-BR")}
                          </div>
                          {nota.chaveAcesso && (
                            <div className="col-span-2">
                              <span className="font-medium">Chave:</span>{" "}
                              <span className="text-xs font-mono">
                                {nota.chaveAcesso}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Produtos */}
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Produtos:
                          </p>
                          <div className="space-y-1">
                            {nota.itens.map((item: any, idx: number) => (
                              <div key={idx} className="text-sm text-gray-600">
                                • {item.quantity}x {item.name} - R${" "}
                                {((item.price * item.quantity) / 100).toFixed(2)}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex flex-col gap-2 ml-4">
                        {nota.urlDanfe && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(nota.urlDanfe, "_blank")}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            DANFE
                          </Button>
                        )}

                        {nota.qrcodeUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(nota.qrcodeUrl, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            QR Code
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReenviarWhatsApp(nota)}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          WhatsApp
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium">Nenhuma nota fiscal emitida</p>
                  <p className="text-sm">
                    As notas emitidas pelo PDV aparecerão aqui
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Reenvio por WhatsApp */}
      <Dialog open={dialogReenvioAberto} onOpenChange={setDialogReenvioAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reenviar DANFE por WhatsApp</DialogTitle>
            <DialogDescription>
              Informe o número do WhatsApp para enviar o DANFE
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Número do WhatsApp</label>
              <Input
                type="tel"
                placeholder="(12) 99123-4567"
                value={telefoneReenvio}
                onChange={(e) => setTelefoneReenvio(e.target.value)}
                maxLength={15}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setDialogReenvioAberto(false)}
              >
                Cancelar
              </Button>
              <Button onClick={confirmarReenvio}>
                <Send className="h-4 w-4 mr-2" />
                Enviar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
