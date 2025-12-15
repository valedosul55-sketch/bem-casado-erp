/**
 * Página de Configurações de Estoque
 * 
 * Permite configurar o método de valoração de estoque por loja:
 * - FIFO (First In, First Out)
 * - Custo Médio Ponderado
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Settings, Info, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminStockSettings() {
  const [selectedStore, setSelectedStore] = useState<number | null>(null);
  const [valuationMethod, setValuationMethod] = useState<"fifo" | "average_cost">("fifo");
  const [taxRegime, setTaxRegime] = useState<"simples" | "presumido" | "real" | "arbitrado">("presumido");

  // Queries
  const { data: stores, refetch: refetchStores } = trpc.stores.getAll.useQuery();

  // Mutations
  const updateStoreMutation = trpc.stores.update.useMutation({
    onSuccess: () => {
      toast.success("Configuração atualizada com sucesso!");
      refetchStores();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  const handleStoreSelect = (storeId: number) => {
    const store = stores?.find((s) => s.id === storeId);
    if (store) {
      setSelectedStore(storeId);
      setValuationMethod((store.stockValuationMethod as "fifo" | "average_cost") || "fifo");
      setTaxRegime((store.taxRegime as "simples" | "presumido" | "real" | "arbitrado") || "presumido");
    }
  };

  const handleSave = () => {
    if (!selectedStore) {
      toast.error("Selecione uma loja");
      return;
    }

    updateStoreMutation.mutate({
      id: selectedStore,
      stockValuationMethod: valuationMethod,
      taxRegime,
    });
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configurações de Estoque</h1>
          <p className="text-muted-foreground">
            Configure o método de valoração de estoque por loja
          </p>
        </div>
        <Settings className="h-8 w-8 text-muted-foreground" />
      </div>

      {/* Informações sobre os métodos */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <Info className="h-5 w-5" />
            Métodos de Valoração de Estoque
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              FIFO (First In, First Out)
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              • Baixa dos lotes mais antigos primeiro<br />
              • Usa o custo real de cada lote<br />
              • CMV varia conforme os lotes utilizados<br />
              • <strong>Recomendado para produtos com validade</strong><br />
              • Rastreabilidade completa
            </p>
          </div>

          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Custo Médio Ponderado
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              • Calcula média de todos os lotes<br />
              • Todas as vendas usam o mesmo custo médio<br />
              • CMV uniforme<br />
              • <strong>Mais simples para relatórios contábeis</strong><br />
              • Mantém FIFO físico (baixa dos mais antigos)
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-300">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              ℹ️ Ambos os métodos são permitidos pela Receita Federal
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Seleção de Loja */}
      <Card>
        <CardHeader>
          <CardTitle>Selecione a Loja</CardTitle>
          <CardDescription>
            Cada loja pode ter seu próprio método de valoração
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stores?.map((store) => (
              <Card
                key={store.id}
                className={`cursor-pointer transition-all ${
                  selectedStore === store.id
                    ? "border-primary border-2 bg-primary/5"
                    : "hover:border-primary/50"
                }`}
                onClick={() => handleStoreSelect(store.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{store.name}</CardTitle>
                    {selectedStore === store.id && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <CardDescription>
                    {store.city}, {store.state}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Método:</span>
                      <Badge variant={store.stockValuationMethod === "fifo" ? "default" : "secondary"}>
                        {store.stockValuationMethod === "average_cost"
                          ? "Custo Médio"
                          : "FIFO"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Regime:</span>
                      <Badge variant="outline">
                        {store.taxRegime === "simples" && "Simples"}
                        {store.taxRegime === "presumido" && "Presumido"}
                        {store.taxRegime === "real" && "Lucro Real"}
                        {store.taxRegime === "arbitrado" && "Arbitrado"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuração do Método */}
      {selectedStore && (
        <Card>
          <CardHeader>
            <CardTitle>Método de Valoração</CardTitle>
            <CardDescription>
              Escolha como o estoque será valorado nas vendas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup value={valuationMethod} onValueChange={(v) => setValuationMethod(v as "fifo" | "average_cost")}>
              <div className="space-y-4">
                {/* FIFO */}
                <Card className={valuationMethod === "fifo" ? "border-primary border-2" : ""}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="fifo" id="fifo" />
                      <div className="flex-1">
                        <Label htmlFor="fifo" className="text-base font-medium cursor-pointer">
                          FIFO (First In, First Out)
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Baixa dos lotes mais antigos primeiro. Usa o custo real de cada lote.
                          Recomendado para produtos com validade.
                        </p>
                        <div className="mt-3 space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">Vantagens</Badge>
                            <span className="text-muted-foreground">
                              Rastreabilidade completa, CMV preciso, ideal para alimentos
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Custo Médio */}
                <Card className={valuationMethod === "average_cost" ? "border-primary border-2" : ""}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="average_cost" id="average_cost" />
                      <div className="flex-1">
                        <Label htmlFor="average_cost" className="text-base font-medium cursor-pointer">
                          Custo Médio Ponderado
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Todas as vendas usam o custo médio de todos os lotes.
                          Mais simples para relatórios contábeis.
                        </p>
                        <div className="mt-3 space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">Vantagens</Badge>
                            <span className="text-muted-foreground">
                              CMV uniforme, simplifica contabilidade, padrão comum
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </RadioGroup>

            {/* Regime Tributário */}
            <div className="space-y-4 pt-6 border-t">
              <div>
                <Label className="text-base font-medium">Regime Tributário</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Informe o regime tributário da loja para cálculos e avisos corretos
                </p>
              </div>

              <RadioGroup value={taxRegime} onValueChange={(v) => setTaxRegime(v as any)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Card className={taxRegime === "simples" ? "border-primary border-2" : ""}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value="simples" id="simples" />
                        <div className="flex-1">
                          <Label htmlFor="simples" className="cursor-pointer font-medium">
                            Simples Nacional
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Alíquota única sobre receita
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={taxRegime === "presumido" ? "border-primary border-2" : ""}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value="presumido" id="presumido" />
                        <div className="flex-1">
                          <Label htmlFor="presumido" className="cursor-pointer font-medium">
                            Lucro Presumido
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Presunção de 8% (comércio)
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={taxRegime === "real" ? "border-primary border-2" : ""}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value="real" id="real" />
                        <div className="flex-1">
                          <Label htmlFor="real" className="cursor-pointer font-medium">
                            Lucro Real
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            IR/CSLL sobre lucro real
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={taxRegime === "arbitrado" ? "border-primary border-2" : ""}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value="arbitrado" id="arbitrado" />
                        <div className="flex-1">
                          <Label htmlFor="arbitrado" className="cursor-pointer font-medium">
                            Lucro Arbitrado
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Arbitramento pela Receita
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </RadioGroup>

              {/* Aviso específico para Lucro Real */}
              {taxRegime === "real" && (
                <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
                  <CardContent className="pt-4">
                    <div className="flex gap-2">
                      <Info className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-900 dark:text-green-100 text-sm">
                          💰 Economia Tributária com Custo Médio
                        </h4>
                        <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                          No Lucro Real, o <strong>Custo Médio Ponderado</strong> pode reduzir
                          impostos (IR e CSLL) em períodos de inflação, pois gera CMV maior e
                          lucro contábil menor.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Aviso para outros regimes */}
              {(taxRegime === "simples" || taxRegime === "presumido") && (
                <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                  <CardContent className="pt-4">
                    <div className="flex gap-2">
                      <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          No {taxRegime === "simples" ? "Simples Nacional" : "Lucro Presumido"},
                          a escolha entre FIFO e Custo Médio <strong>não afeta impostos</strong>,
                          pois a base de cálculo é a receita, não o lucro real.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedStore(null);
                  setValuationMethod("fifo");
                  setTaxRegime("presumido");
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={updateStoreMutation.isPending}>
                {updateStoreMutation.isPending ? "Salvando..." : "Salvar Configuração"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Aviso */}
      <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Info className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                Atenção
              </h4>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                A alteração do método de valoração afeta apenas as <strong>novas vendas</strong>.
                Vendas anteriores mantêm o método que estava configurado no momento da venda.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
