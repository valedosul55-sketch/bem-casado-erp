import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, RefreshCw, Mail, Newspaper, Clock, CheckCircle, XCircle, AlertTriangle, Send } from "lucide-react";
import { toast } from 'sonner';

export default function AdminMonitoring() {
  
  const [isRunningNewsAgent, setIsRunningNewsAgent] = useState(false);
  const [isRunningScraping, setIsRunningScraping] = useState(false);
  const [isSendingDigest, setIsSendingDigest] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [lastNewsAgentResult, setLastNewsAgentResult] = useState<any>(null);
  const [lastScrapingResult, setLastScrapingResult] = useState<any>(null);
  const [lastDigestResult, setLastDigestResult] = useState<any>(null);
  const [lastEmailTestResult, setLastEmailTestResult] = useState<any>(null);

  const runNewsAgent = trpc.monitor.runNewsAgent.useMutation({
    onSuccess: (data) => {
      setLastNewsAgentResult(data);
      setIsRunningNewsAgent(false);
      if (data.success) {
        toast.success('✅ Agente Executado!', {
          description: 'Verifique seu email para ver o relatório de notícias fiscais.',
        });
      } else {
        toast.error('❌ Erro no Agente', {
          description: data.message,
        });
      }
    },
    onError: (error) => {
      setIsRunningNewsAgent(false);
      setLastNewsAgentResult({ success: false, message: error.message });
toast.error('❌ Erro', {
          description: error.message,
        });
    },
  });

  const runScraping = trpc.monitor.runManualScraping.useMutation({
    onSuccess: (data) => {
      setLastScrapingResult(data);
      setIsRunningScraping(false);
toast.success('✅ Scraping Concluído!', {
          description: `${data.results?.length || 0} fontes processadas.`,
        });
    },
    onError: (error) => {
      setIsRunningScraping(false);
toast.error('❌ Erro no Scraping', {
          description: error.message,
        });
    },
  });

  const sendDigest = trpc.monitor.sendDigest.useMutation({
    onSuccess: (data) => {
      setLastDigestResult(data);
      setIsSendingDigest(false);
      if (data.success) {
        toast.success('✅ Digest Enviado!', {
          description: `${data.count} atualizações enviadas por email.`,
        });
      } else {
        toast.info('⚠️ Sem Atualizações', {
          description: data.message,
        });
      }
    },
    onError: (error) => {
      setIsSendingDigest(false);
      toast.error('❌ Erro ao Enviar Digest', {
          description: error.message,
        });
    },
  });

  const testEmail = trpc.monitor.testEmail.useMutation({
    onSuccess: (data) => {
      setLastEmailTestResult(data);
      setIsTestingEmail(false);
      if (data.success) {
        toast.success('✅ Email Enviado!', {
          description: data.message,
        });
      } else {
        toast.error('❌ Erro no Email', {
          description: data.message,
        });
      }
    },
    onError: (error) => {
      setIsTestingEmail(false);
      setLastEmailTestResult({ success: false, message: error.message });
      toast.error('❌ Erro', {
        description: error.message,
      });
    },
  });

  const handleRunNewsAgent = () => {
    setIsRunningNewsAgent(true);
    setLastNewsAgentResult(null);
    runNewsAgent.mutate();
  };

  const handleRunScraping = () => {
    setIsRunningScraping(true);
    setLastScrapingResult(null);
    runScraping.mutate();
  };

  const handleSendDigest = () => {
    setIsSendingDigest(true);
    setLastDigestResult(null);
    sendDigest.mutate();
  };

  const handleTestEmail = () => {
    setIsTestingEmail(true);
    setLastEmailTestResult(null);
    testEmail.mutate();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">🤖 Central de Monitoramento</h1>
        <p className="text-gray-600 mt-2">
          Gerencie os agentes automáticos e execute testes manuais
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Agente de Notícias Fiscais */}
        <Card className="border-2 border-blue-200">
          <CardHeader className="bg-blue-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Newspaper className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Agente de Notícias Fiscais</CardTitle>
                <CardDescription>Monitora DOU, RFB, CONFAZ, CFC, MAPA</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Execução automática: <strong>08:00 (Seg-Sex)</strong></span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>Envia email com notícias relevantes</span>
              </div>

              {lastNewsAgentResult && (
                <div className={`p-3 rounded-lg ${lastNewsAgentResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center gap-2">
                    {lastNewsAgentResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${lastNewsAgentResult.success ? 'text-green-700' : 'text-red-700'}`}>
                      {lastNewsAgentResult.message}
                    </span>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleRunNewsAgent} 
                disabled={isRunningNewsAgent}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isRunningNewsAgent ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Executando...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Executar Agora
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Scraping de Produtos */}
        <Card className="border-2 border-purple-200">
          <CardHeader className="bg-purple-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <RefreshCw className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Scraping de Produtos</CardTitle>
                <CardDescription>Monitora preços e promoções</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Execução: <strong>06:00, 12:00, 18:00</strong></span>
              </div>

              {lastScrapingResult && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      {lastScrapingResult.results?.length || 0} fontes processadas
                    </span>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleRunScraping} 
                disabled={isRunningScraping}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isRunningScraping ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Executando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Executar Scraping
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Digest Diário */}
        <Card className="border-2 border-orange-200">
          <CardHeader className="bg-orange-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Digest Diário</CardTitle>
                <CardDescription>Email com atualizações do dia</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Execução automática: <strong>08:00</strong></span>
              </div>

              {lastDigestResult && (
                <div className={`p-3 rounded-lg ${lastDigestResult.success ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                  <div className="flex items-center gap-2">
                    {lastDigestResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    )}
                    <span className={`text-sm font-medium ${lastDigestResult.success ? 'text-green-700' : 'text-yellow-700'}`}>
                      {lastDigestResult.success ? `${lastDigestResult.count} atualizações enviadas` : lastDigestResult.message}
                    </span>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleSendDigest} 
                disabled={isSendingDigest}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {isSendingDigest ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar Digest
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teste de Email */}
      <div className="mt-6">
        <Card className="border-2 border-green-200">
          <CardHeader className="bg-green-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Send className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">📧 Teste de Email</CardTitle>
                <CardDescription>Verificar se o envio de email está funcionando</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Envia um email de teste simples para verificar a configuração do Resend.
              </p>

              {lastEmailTestResult && (
                <div className={`p-3 rounded-lg ${lastEmailTestResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center gap-2">
                    {lastEmailTestResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${lastEmailTestResult.success ? 'text-green-700' : 'text-red-700'}`}>
                      {lastEmailTestResult.message}
                    </span>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleTestEmail} 
                disabled={isTestingEmail}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isTestingEmail ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Email de Teste
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações do Sistema */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>📋 Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-2">Agente de Notícias Fiscais</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Fontes:</strong> DOU, Receita Federal, CONFAZ, CFC, MAPA, CONAB</li>
                  <li>• <strong>Horário:</strong> Segunda a Sexta, 08:00</li>
                  <li>• <strong>Palavras-chave:</strong> ICMS, PIS, COFINS, NF-e, SPED, NCM, etc.</li>
                  <li>• <strong>Categorias:</strong> Legislação, Tributação, Contabilidade, Agronegócio</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Configuração de Email</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>DIRECTOR_EMAIL:</strong> {import.meta.env.VITE_DIRECTOR_EMAIL || 'Configurar no Railway'}</li>
                  <li>• <strong>Provedor:</strong> Resend</li>
                  <li>• <strong>Timezone:</strong> America/Sao_Paulo</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
