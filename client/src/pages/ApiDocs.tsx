/**
 * Página de Documentação da API Pública
 * 
 * Documentação completa para desenvolvedores que desejam integrar
 * com a API de estoque da Bem Casado.
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code, Copy, Check, Key, Zap, Shield, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function ApiDocs() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast.success("Código copiado!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ code, language = "javascript", id }: { code: string; language?: string; id: string }) => (
    <div className="relative">
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
        <code className={`language-${language}`}>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2"
        onClick={() => copyToClipboard(code, id)}
      >
        {copiedCode === id ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Pública - Documentação</h1>
          <p className="text-muted-foreground">
            Integre seu sistema com a API de estoque da Bem Casado
          </p>
        </div>
        <Code className="h-8 w-8 text-muted-foreground" />
      </div>

      {/* Informações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Gerais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium">Base URL</h3>
                <code className="text-sm text-muted-foreground">
                  https://api.bemcasado.com.br/api/trpc
                </code>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium">Autenticação</h3>
                <p className="text-sm text-muted-foreground">API Key via header</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Key className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium">Rate Limit</h3>
                <p className="text-sm text-muted-foreground">100 req/min</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Documentação */}
      <Tabs defaultValue="quickstart" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="quickstart">Início Rápido</TabsTrigger>
          <TabsTrigger value="auth">Autenticação</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="examples">Exemplos</TabsTrigger>
          <TabsTrigger value="errors">Erros</TabsTrigger>
        </TabsList>

        {/* Tab: Início Rápido */}
        <TabsContent value="quickstart" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Início Rápido</CardTitle>
              <CardDescription>
                Comece a usar a API em 3 passos simples
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Passo 1 */}
              <div>
                <h3 className="font-medium mb-2">1. Obtenha sua API Key</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Entre em contato com o suporte para solicitar sua chave de API.
                </p>
                <div className="bg-muted p-3 rounded-lg">
                  <code className="text-sm">X-API-Key: sua_chave_aqui</code>
                </div>
              </div>

              {/* Passo 2 */}
              <div>
                <h3 className="font-medium mb-2">2. Faça sua primeira requisição</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Teste a API com o endpoint de health check:
                </p>
                <CodeBlock
                  id="quickstart-health"
                  code={`curl -X GET https://api.bemcasado.com.br/api/trpc/publicApi.health \\
  -H "Content-Type: application/json"`}
                  language="bash"
                />
              </div>

              {/* Passo 3 */}
              <div>
                <h3 className="font-medium mb-2">3. Consulte disponibilidade de estoque</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Verifique se um produto está disponível:
                </p>
                <CodeBlock
                  id="quickstart-availability"
                  code={`curl -X GET "https://api.bemcasado.com.br/api/trpc/publicApi.checkAvailability?input=%7B%22productId%22%3A1%2C%22quantity%22%3A10%7D" \\
  -H "X-API-Key: sua_chave_aqui" \\
  -H "Content-Type: application/json"`}
                  language="bash"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Autenticação */}
        <TabsContent value="auth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Autenticação</CardTitle>
              <CardDescription>
                Como autenticar suas requisições
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">API Key</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Todas as requisições (exceto health check) requerem uma API key válida no header <code>X-API-Key</code>.
                </p>
                <CodeBlock
                  id="auth-example"
                  code={`fetch('https://api.bemcasado.com.br/api/trpc/publicApi.listProducts', {
  headers: {
    'X-API-Key': 'sua_chave_aqui',
    'Content-Type': 'application/json'
  }
})`}
                  language="javascript"
                />
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                      Segurança
                    </h4>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                      Nunca exponha sua API key em código client-side (frontend). 
                      Sempre faça as requisições do seu servidor backend.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Endpoints */}
        <TabsContent value="endpoints" className="space-y-4">
          {/* Health Check */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="secondary">GET</Badge>
                    publicApi.health
                  </CardTitle>
                  <CardDescription>Verifica status da API</CardDescription>
                </div>
                <Badge>Público</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium text-sm mb-2">Resposta</h4>
                <CodeBlock
                  id="health-response"
                  code={`{
  "status": "ok",
  "timestamp": "2024-12-14T12:00:00.000Z",
  "version": "1.0.0"
}`}
                  language="json"
                />
              </div>
            </CardContent>
          </Card>

          {/* Check Availability */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Badge>GET</Badge>
                    publicApi.checkAvailability
                  </CardTitle>
                  <CardDescription>Consulta disponibilidade de produto</CardDescription>
                </div>
                <Badge variant="destructive">Requer API Key</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium text-sm mb-2">Parâmetros</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <code className="bg-muted px-2 py-1 rounded">productId</code>
                    <Badge variant="outline" className="text-xs">number</Badge>
                    <Badge variant="destructive" className="text-xs">obrigatório</Badge>
                    <span className="text-muted-foreground">ID do produto</span>
                  </div>
                  <div className="flex gap-2">
                    <code className="bg-muted px-2 py-1 rounded">storeId</code>
                    <Badge variant="outline" className="text-xs">number</Badge>
                    <Badge variant="secondary" className="text-xs">opcional</Badge>
                    <span className="text-muted-foreground">ID da loja</span>
                  </div>
                  <div className="flex gap-2">
                    <code className="bg-muted px-2 py-1 rounded">quantity</code>
                    <Badge variant="outline" className="text-xs">number</Badge>
                    <Badge variant="secondary" className="text-xs">opcional</Badge>
                    <span className="text-muted-foreground">Quantidade desejada</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">Resposta</h4>
                <CodeBlock
                  id="availability-response"
                  code={`{
  "productId": 1,
  "productName": "Arroz Branco 1kg",
  "productBrand": "Bem Casado",
  "productPrice": 1200,
  "available": 450,
  "reserved": 50,
  "stock": 500,
  "isAvailable": true,
  "stores": [
    {
      "storeId": 1,
      "storeName": "Matriz",
      "stock": 500
    }
  ]
}`}
                  language="json"
                />
              </div>
            </CardContent>
          </Card>

          {/* Create Reservation */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-green-500">POST</Badge>
                    publicApi.createReservation
                  </CardTitle>
                  <CardDescription>Cria reserva temporária de estoque (15 min)</CardDescription>
                </div>
                <Badge variant="destructive">Requer API Key</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium text-sm mb-2">Body</h4>
                <CodeBlock
                  id="reservation-request"
                  code={`{
  "productId": 1,
  "storeId": 1,
  "quantity": 10,
  "externalOrderId": "ORDER-123" // opcional
}`}
                  language="json"
                />
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">Resposta</h4>
                <CodeBlock
                  id="reservation-response"
                  code={`{
  "reservationId": 42,
  "productId": 1,
  "storeId": 1,
  "quantity": 10,
  "expiresAt": "2024-12-14T12:15:00.000Z",
  "expiresIn": 900
}`}
                  language="json"
                />
              </div>
            </CardContent>
          </Card>

          {/* Confirm Sale */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-green-500">POST</Badge>
                    publicApi.confirmSale
                  </CardTitle>
                  <CardDescription>Confirma venda e baixa estoque</CardDescription>
                </div>
                <Badge variant="destructive">Requer API Key</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium text-sm mb-2">Body</h4>
                <CodeBlock
                  id="confirm-request"
                  code={`{
  "reservationId": 42,
  "orderId": 123 // opcional
}`}
                  language="json"
                />
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">Resposta</h4>
                <CodeBlock
                  id="confirm-response"
                  code={`{
  "success": true,
  "reservationId": 42,
  "movementId": 156,
  "productId": 1,
  "quantity": 10
}`}
                  language="json"
                />
              </div>
            </CardContent>
          </Card>

          {/* Cancel Reservation */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-green-500">POST</Badge>
                    publicApi.cancelReservation
                  </CardTitle>
                  <CardDescription>Cancela reserva ativa</CardDescription>
                </div>
                <Badge variant="destructive">Requer API Key</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium text-sm mb-2">Body</h4>
                <CodeBlock
                  id="cancel-request"
                  code={`{
  "reservationId": 42
}`}
                  language="json"
                />
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">Resposta</h4>
                <CodeBlock
                  id="cancel-response"
                  code={`{
  "success": true,
  "reservationId": 42
}`}
                  language="json"
                />
              </div>
            </CardContent>
          </Card>

          {/* List Products */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="secondary">GET</Badge>
                    publicApi.listProducts
                  </CardTitle>
                  <CardDescription>Lista produtos com estoque</CardDescription>
                </div>
                <Badge variant="destructive">Requer API Key</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium text-sm mb-2">Parâmetros</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <code className="bg-muted px-2 py-1 rounded">storeId</code>
                    <Badge variant="outline" className="text-xs">number</Badge>
                    <Badge variant="secondary" className="text-xs">opcional</Badge>
                  </div>
                  <div className="flex gap-2">
                    <code className="bg-muted px-2 py-1 rounded">category</code>
                    <Badge variant="outline" className="text-xs">string</Badge>
                    <Badge variant="secondary" className="text-xs">opcional</Badge>
                  </div>
                  <div className="flex gap-2">
                    <code className="bg-muted px-2 py-1 rounded">limit</code>
                    <Badge variant="outline" className="text-xs">number</Badge>
                    <Badge variant="secondary" className="text-xs">padrão: 50</Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">Resposta</h4>
                <CodeBlock
                  id="list-response"
                  code={`[
  {
    "productId": 1,
    "productName": "Arroz Branco 1kg",
    "productBrand": "Bem Casado",
    "productCategory": "Arroz",
    "productPrice": 1200,
    "productEan13": "7891234567890",
    "storeId": 1,
    "storeName": "Matriz",
    "stock": 500,
    "reserved": 50,
    "available": 450
  }
]`}
                  language="json"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Exemplos */}
        <TabsContent value="examples" className="space-y-4">
          {/* JavaScript */}
          <Card>
            <CardHeader>
              <CardTitle>JavaScript / Node.js</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock
                id="example-js"
                code={`// Verificar disponibilidade
const response = await fetch(
  'https://api.bemcasado.com.br/api/trpc/publicApi.checkAvailability?input=' +
  encodeURIComponent(JSON.stringify({ productId: 1, quantity: 10 })),
  {
    headers: {
      'X-API-Key': process.env.API_KEY,
      'Content-Type': 'application/json'
    }
  }
);

const data = await response.json();
console.log('Disponível:', data.result.data.available);

// Criar reserva
const reservationResponse = await fetch(
  'https://api.bemcasado.com.br/api/trpc/publicApi.createReservation',
  {
    method: 'POST',
    headers: {
      'X-API-Key': process.env.API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      productId: 1,
      storeId: 1,
      quantity: 10,
      externalOrderId: 'ORDER-123'
    })
  }
);

const reservation = await reservationResponse.json();
console.log('Reserva criada:', reservation.result.data.reservationId);

// Confirmar venda
const confirmResponse = await fetch(
  'https://api.bemcasado.com.br/api/trpc/publicApi.confirmSale',
  {
    method: 'POST',
    headers: {
      'X-API-Key': process.env.API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      reservationId: reservation.result.data.reservationId,
      orderId: 123
    })
  }
);

const result = await confirmResponse.json();
console.log('Venda confirmada:', result.result.data.success);`}
                language="javascript"
              />
            </CardContent>
          </Card>

          {/* Python */}
          <Card>
            <CardHeader>
              <CardTitle>Python</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock
                id="example-python"
                code={`import requests
import json
import os

API_KEY = os.getenv('API_KEY')
BASE_URL = 'https://api.bemcasado.com.br/api/trpc'

headers = {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json'
}

# Verificar disponibilidade
params = {'input': json.dumps({'productId': 1, 'quantity': 10})}
response = requests.get(
    f'{BASE_URL}/publicApi.checkAvailability',
    headers=headers,
    params=params
)
data = response.json()
print(f"Disponível: {data['result']['data']['available']}")

# Criar reserva
reservation_data = {
    'productId': 1,
    'storeId': 1,
    'quantity': 10,
    'externalOrderId': 'ORDER-123'
}
response = requests.post(
    f'{BASE_URL}/publicApi.createReservation',
    headers=headers,
    json=reservation_data
)
reservation = response.json()
print(f"Reserva criada: {reservation['result']['data']['reservationId']}")

# Confirmar venda
confirm_data = {
    'reservationId': reservation['result']['data']['reservationId'],
    'orderId': 123
}
response = requests.post(
    f'{BASE_URL}/publicApi.confirmSale',
    headers=headers,
    json=confirm_data
)
result = response.json()
print(f"Venda confirmada: {result['result']['data']['success']}")`}
                language="python"
              />
            </CardContent>
          </Card>

          {/* PHP */}
          <Card>
            <CardHeader>
              <CardTitle>PHP</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock
                id="example-php"
                code={`<?php

$apiKey = getenv('API_KEY');
$baseUrl = 'https://api.bemcasado.com.br/api/trpc';

$headers = [
    'X-API-Key: ' . $apiKey,
    'Content-Type: application/json'
];

// Verificar disponibilidade
$params = http_build_query([
    'input' => json_encode(['productId' => 1, 'quantity' => 10])
]);

$ch = curl_init("$baseUrl/publicApi.checkAvailability?$params");
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$data = json_decode($response, true);
echo "Disponível: " . $data['result']['data']['available'] . "\\n";

// Criar reserva
$reservationData = [
    'productId' => 1,
    'storeId' => 1,
    'quantity' => 10,
    'externalOrderId' => 'ORDER-123'
];

$ch = curl_init("$baseUrl/publicApi.createReservation");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($reservationData));
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$reservation = json_decode($response, true);
echo "Reserva criada: " . $reservation['result']['data']['reservationId'] . "\\n";

// Confirmar venda
$confirmData = [
    'reservationId' => $reservation['result']['data']['reservationId'],
    'orderId' => 123
];

$ch = curl_init("$baseUrl/publicApi.confirmSale");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($confirmData));
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$result = json_decode($response, true);
echo "Venda confirmada: " . ($result['result']['data']['success'] ? 'Sim' : 'Não') . "\\n";

?>`}
                language="php"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Erros */}
        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Códigos de Erro</CardTitle>
              <CardDescription>
                Possíveis erros e como tratá-los
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-medium">401 UNAUTHORIZED</h4>
                  <p className="text-sm text-muted-foreground">
                    API key ausente ou inválida. Verifique o header X-API-Key.
                  </p>
                </div>

                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-medium">400 BAD_REQUEST</h4>
                  <p className="text-sm text-muted-foreground">
                    Parâmetros inválidos ou estoque insuficiente.
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium">404 NOT_FOUND</h4>
                  <p className="text-sm text-muted-foreground">
                    Produto, loja ou reserva não encontrados.
                  </p>
                </div>

                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-medium">429 TOO_MANY_REQUESTS</h4>
                  <p className="text-sm text-muted-foreground">
                    Rate limit excedido. Aguarde antes de fazer novas requisições.
                  </p>
                </div>

                <div className="border-l-4 border-gray-500 pl-4">
                  <h4 className="font-medium">500 INTERNAL_SERVER_ERROR</h4>
                  <p className="text-sm text-muted-foreground">
                    Erro interno do servidor. Entre em contato com o suporte.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Formato de Erro</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock
                id="error-format"
                code={`{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Insufficient stock. Available: 5, Requested: 10"
  }
}`}
                language="json"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Suporte */}
      <Card>
        <CardHeader>
          <CardTitle>Precisa de Ajuda?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Entre em contato com nossa equipe de suporte para obter ajuda ou solicitar sua API key.
          </p>
          <div className="flex gap-4">
            <Button>
              Solicitar API Key
            </Button>
            <Button variant="outline">
              Contatar Suporte
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
