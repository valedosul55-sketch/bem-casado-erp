import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { RefreshCw, Mail, ExternalLink, Check } from "lucide-react";

export default function Monitor() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Queries
  const { data: updates, refetch: refetchUpdates } = trpc.monitor.getAllUpdates.useQuery({
    limit: 100,
  });
  const { data: unreadUpdates } = trpc.monitor.getUnreadUpdates.useQuery();
  const { data: categories } = trpc.monitor.getCategories.useQuery();
  const { data: sources } = trpc.monitor.getSources.useQuery();
  const { data: logs } = trpc.monitor.getScrapingLogs.useQuery({ limit: 20 });

  // Mutations
  const markAsReadMutation = trpc.monitor.markAsRead.useMutation({
    onSuccess: () => {
      refetchUpdates();
      toast.success("Marcado como lido");
    },
  });

  const runScrapingMutation = trpc.monitor.runManualScraping.useMutation({
    onSuccess: (data) => {
      refetchUpdates();
      const totalNew = data.results.reduce((sum, r) => sum + r.itemsNew, 0);
      toast.success(`Scraping concluído! ${totalNew} novas atualizações encontradas`);
    },
    onError: () => {
      toast.error("Erro ao executar scraping");
    },
  });

  const sendDigestMutation = trpc.monitor.sendDigest.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`Email enviado com ${data.count} atualizações`);
      } else {
        toast.info("Nenhuma atualização para enviar");
      }
    },
    onError: () => {
      toast.error("Erro ao enviar email");
    },
  });

  const handleMarkAsRead = (updateId: number) => {
    markAsReadMutation.mutate({ updateId });
  };

  const handleRunScraping = () => {
    toast.info("Iniciando scraping... Isso pode levar alguns minutos");
    runScrapingMutation.mutate();
  };

  const handleSendDigest = () => {
    sendDigestMutation.mutate();
  };

  const categoryNames: Record<number, string> = {
    1: "Fiscal",
    2: "Contábil",
    3: "Agronegócio",
  };

  const getCategoryColor = (categoryId: number) => {
    const colors: Record<number, string> = {
      1: "bg-blue-100 text-blue-800",
      2: "bg-green-100 text-green-800",
      3: "bg-yellow-100 text-yellow-800",
    };
    return colors[categoryId] || "bg-gray-100 text-gray-800";
  };

  const filteredUpdates = selectedCategory
    ? updates?.filter((u) => u.categoryId === selectedCategory)
    : updates;

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Sistema de Monitoramento</h1>
          <p className="text-muted-foreground">
            Atualizações automáticas de legislação fiscal, contábil e agronegócio
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSendDigest}
            disabled={sendDigestMutation.isPending}
            variant="outline"
          >
            <Mail className="mr-2 h-4 w-4" />
            Enviar Digest
          </Button>
          <Button onClick={handleRunScraping} disabled={runScrapingMutation.isPending}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${runScrapingMutation.isPending ? "animate-spin" : ""}`}
            />
            Atualizar Agora
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Atualizações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{updates?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Não Lidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadUpdates?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Fontes Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sources?.filter((s) => s.isActive === 1).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="updates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="updates">Atualizações</TabsTrigger>
          <TabsTrigger value="sources">Fontes</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        {/* Tab de Atualizações */}
        <TabsContent value="updates" className="space-y-4">
          {/* Filtros de Categoria */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              Todas
            </Button>
            {categories?.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
              </Button>
            ))}
          </div>

          {/* Lista de Atualizações */}
          <div className="space-y-4">
            {filteredUpdates?.map((update) => (
              <Card key={update.id} className={update.isRead === 0 ? "border-l-4 border-l-blue-500" : ""}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getCategoryColor(update.categoryId)}>
                          {categoryNames[update.categoryId] || `Cat ${update.categoryId}`}
                        </Badge>
                        {update.relevanceScore && (
                          <Badge variant="outline">Score: {update.relevanceScore}/100</Badge>
                        )}
                        {update.isRead === 0 && (
                          <Badge variant="secondary">Não lido</Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{update.title}</CardTitle>
                      <CardDescription>
                        {update.publishedAt
                          ? new Date(update.publishedAt).toLocaleDateString("pt-BR")
                          : new Date(update.createdAt).toLocaleDateString("pt-BR")}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {update.url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={update.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {update.isRead === 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(update.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {update.summary || update.content.substring(0, 300) + "..."}
                  </p>
                  {update.tags && (
                    <div className="flex gap-1 flex-wrap">
                      {JSON.parse(update.tags).map((tag: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {filteredUpdates?.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Nenhuma atualização encontrada
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Tab de Fontes */}
        <TabsContent value="sources" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sources?.map((source) => (
              <Card key={source.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{source.name}</CardTitle>
                    <Badge variant={source.isActive === 1 ? "default" : "secondary"}>
                      {source.isActive === 1 ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs break-all">{source.url}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <div>Tipo: {source.type}</div>
                    {source.lastScrapedAt && (
                      <div>
                        Última atualização:{" "}
                        {new Date(source.lastScrapedAt).toLocaleString("pt-BR")}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab de Logs */}
        <TabsContent value="logs" className="space-y-4">
          <div className="space-y-2">
            {logs?.map((log) => (
              <Card key={log.id}>
                <CardContent className="py-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <Badge
                        variant={
                          log.status === "success"
                            ? "default"
                            : log.status === "error"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {log.status}
                      </Badge>
                      <div className="text-sm">
                        <div className="font-medium">
                          {sources?.find((s) => s.id === log.sourceId)?.name || `Source ${log.sourceId}`}
                        </div>
                        <div className="text-muted-foreground">
                          {log.itemsNew} novos de {log.itemsFound} encontrados
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString("pt-BR")}
                    </div>
                  </div>
                  {log.errorMessage && (
                    <div className="mt-2 text-sm text-red-600">{log.errorMessage}</div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
