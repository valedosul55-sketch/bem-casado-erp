import { useState, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Package } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AdminNFe() {
  const [xmlContent, setXmlContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mutations
  const validateMutation = trpc.nfeImport.validate.useMutation();
  const importMutation = trpc.nfeImport.import.useMutation();

  // Processar arquivo selecionado
  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith('.xml')) {
      toast.error('Arquivo inválido', {
        description: 'Por favor, selecione um arquivo XML',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setXmlContent(content);
      setFileName(file.name);
      setValidationResult(null);
      setImportResult(null);
      
      toast.success('Arquivo carregado', {
        description: `${file.name} pronto para validação`,
      });
    };
    reader.readAsText(file);
  };

  // Drag & Drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Click para selecionar arquivo
  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Validar XML
  const handleValidate = async () => {
    if (!xmlContent) {
      toast.error('Nenhum arquivo carregado');
      return;
    }

    try {
      const result = await validateMutation.mutateAsync({ xmlContent });
      setValidationResult(result);
      
      toast.success('XML válido!', {
        description: 'O arquivo está pronto para importação',
      });
    } catch (error) {
      setValidationResult({ success: false, message: (error as Error).message });
      
      toast.error('XML inválido', {
        description: (error as Error).message,
      });
    }
  };

  // Importar NF-e
  const handleImport = async () => {
    if (!xmlContent) {
      toast.error('Nenhum arquivo carregado');
      return;
    }

    try {
      const result = await importMutation.mutateAsync({ xmlContent });
      setImportResult(result);
      
      toast.success('NF-e importada com sucesso!', {
        description: result.message,
        duration: 10000,
      });

      // Limpar formulário
      setXmlContent('');
      setFileName('');
      setValidationResult(null);
    } catch (error) {
      toast.error('Erro ao importar NF-e', {
        description: (error as Error).message,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Importação de NF-e</h2>
        <p className="text-gray-600 mt-1">
          Importe XML de Notas Fiscais Eletrônicas para registrar entrada de produtos
        </p>
      </div>

      {/* Área de Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload de XML</CardTitle>
          <CardDescription>
            Arraste e solte o arquivo XML da NF-e ou clique para selecionar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleClickUpload}
            style={{ cursor: 'pointer' }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xml"
              onChange={handleFileInputChange}
              className="hidden"
            />
            
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            
            {fileName ? (
              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  <FileText className="w-5 h-5 inline mr-2" />
                  {fileName}
                </p>
                <p className="text-sm text-gray-500">
                  Clique para selecionar outro arquivo
                </p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Arraste e solte o arquivo XML aqui
                </p>
                <p className="text-sm text-gray-500">
                  ou clique para selecionar do seu computador
                </p>
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          {xmlContent && (
            <div className="flex gap-3 mt-4">
              <Button
                onClick={handleValidate}
                disabled={validateMutation.isPending}
                variant="outline"
              >
                {validateMutation.isPending ? 'Validando...' : 'Validar XML'}
              </Button>
              
              <Button
                onClick={handleImport}
                disabled={importMutation.isPending || !validationResult?.success}
              >
                {importMutation.isPending ? 'Importando...' : 'Importar NF-e'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultado da Validação */}
      {validationResult && (
        <Alert variant={validationResult.success ? 'default' : 'destructive'}>
          {validationResult.success ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <AlertTitle>
            {validationResult.success ? 'XML Válido' : 'XML Inválido'}
          </AlertTitle>
          <AlertDescription>
            {validationResult.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Resultado da Importação */}
      {importResult && importResult.data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              NF-e Importada com Sucesso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Informações da NF-e */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Número</p>
                <p className="font-medium">{importResult.data.nfeInfo.numero}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Série</p>
                <p className="font-medium">{importResult.data.nfeInfo.serie}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Data de Emissão</p>
                <p className="font-medium">
                  {new Date(importResult.data.nfeInfo.dataEmissao).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="font-medium">
                  R$ {(importResult.data.nfeInfo.valorTotal / 100).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>

            {/* Fornecedor */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Fornecedor</p>
              <p className="font-medium">{importResult.data.nfeInfo.fornecedor.nome}</p>
              <p className="text-sm text-gray-500">
                CNPJ: {importResult.data.nfeInfo.fornecedor.cnpj}
              </p>
            </div>

            {/* Produtos Importados */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold">
                  Produtos Importados ({importResult.data.produtosProcessados.length})
                </h3>
              </div>
              
              <div className="space-y-2">
                {importResult.data.produtosProcessados.map((produto: any, index: number) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{produto.nome}</p>
                        <p className="text-sm text-gray-500">
                          Quantidade: {produto.quantidade} {produto.unidade}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          R$ {(produto.valorUnitario / 100).toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-sm text-gray-500">
                          Total: R$ {(produto.valorTotal / 100).toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Avisos */}
            {importResult.data.avisos && importResult.data.avisos.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Avisos</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside">
                    {importResult.data.avisos.map((aviso: string, index: number) => (
                      <li key={index}>{aviso}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
