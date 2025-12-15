import { useState, useRef, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Scan, ArrowUpCircle, ArrowDownCircle, Package, CheckCircle, XCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export default function AdminQuickStock() {
  const [barcode, setBarcode] = useState('');
  const [scannedProduct, setScannedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState('1');
  const [movementType, setMovementType] = useState<'entry' | 'exit'>('entry');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [storeId, setStoreId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const [recentMovements, setRecentMovements] = useState<any[]>([]);
  const [showQuickRegister, setShowQuickRegister] = useState(false);
  const [newProductData, setNewProductData] = useState({
    name: '',
    price: '',
    brand: '',
    category: '',
    unit: 'un',
    initialStock: '0',
  });

  // Queries
  const { data: stores } = trpc.stock.listByStore.useQuery({ storeId: 1 }); // TODO: usar storeId dinâmico
  const { data: recentData, refetch: refetchRecent } = trpc.stockMovements.recent.useQuery({ limit: 5 });

  // Mutations
  const createMovement = trpc.stockMovements.create.useMutation();
  const createProduct = trpc.products.create.useMutation();

  // Atualizar movimentações recentes
  useEffect(() => {
    if (recentData) {
      setRecentMovements(recentData);
    }
  }, [recentData]);

  // Focar no campo de código de barras ao carregar
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  // Cadastrar produto rapidamente quando não encontrado
  const handleQuickRegister = async () => {
    if (!newProductData.name || !newProductData.price) {
      toast.error('Preencha nome e preço');
      return;
    }

    setIsProcessing(true);
    
    try {
      const result = await createProduct.mutateAsync({
        name: newProductData.name,
        price: Math.round(parseFloat(newProductData.price) * 100),
        brand: newProductData.brand || undefined,
        category: newProductData.category || undefined,
        unit: newProductData.unit,
        ean13: barcode || undefined,
        active: 1,
      });

      // Tocar som de sucesso (beep simples)
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800; // Frequência do beep
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      } catch (error) {
        console.log('Não foi possível tocar o som:', error);
      }

      // Registrar movimentação de entrada se houver quantidade inicial
      const initialStock = parseInt(newProductData.initialStock);
      if (initialStock > 0) {
        try {
          await createMovement.mutateAsync({
            productId: result.id,
            movementType: 'entry',
            quantity: initialStock,
            reason: 'Estoque inicial',
            notes: 'Cadastro rápido de produto',
          });
        } catch (movError) {
          console.error('Erro ao registrar movimentação:', movError);
          toast.warning('Produto cadastrado, mas houve erro ao registrar estoque inicial');
        }
      }

      toast.success('✅ Cadastro efetuado com sucesso!', {
        description: `Produto: ${newProductData.name} | Preço: R$ ${newProductData.price}${initialStock > 0 ? ` | Estoque: ${initialStock}` : ''}`,
        duration: 10000,
      });

      // Limpar formulário após sucesso
      setBarcode('');
      setScannedProduct(null);
      setShowQuickRegister(false);
      setNewProductData({ name: '', price: '', brand: '', category: '', unit: 'un', initialStock: '0' });
    } catch (error) {
      toast.error('Erro ao cadastrar produto', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Buscar produto quando código de barras for digitado/escaneado
  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!barcode.trim()) {
      toast.error('Digite ou escaneie um código de barras');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Buscar produto por código de barras
      const response = await fetch(`/api/trpc/stockMovements.getByBarcode?input=${encodeURIComponent(JSON.stringify({ barcode: barcode.trim() }))}`);
      const result = await response.json();
      const product = result.result?.data;
      
      if (product) {
        setScannedProduct(product);
        toast.success(`Produto encontrado: ${product.name}`);
        setShowQuickRegister(false);
      } else {
        toast.info('Produto não encontrado - Cadastre agora!', {
          description: `Código: ${barcode}`,
        });
        setScannedProduct(null);
        setShowQuickRegister(true);
      }
    } catch (error) {
      toast.info('Produto não encontrado - Cadastre agora!', {
        description: `Código: ${barcode}`,
      });
      setScannedProduct(null);
      setShowQuickRegister(true);
    } finally {
      setIsProcessing(false);
    }
  };

  // Registrar movimentação
  const handleRegisterMovement = async () => {
    if (!scannedProduct) {
      toast.error('Escaneie um produto primeiro');
      return;
    }

    if (!quantity || parseInt(quantity) <= 0) {
      toast.error('Quantidade inválida');
      return;
    }

    if (!reason) {
      toast.error('Selecione um motivo');
      return;
    }

    setIsProcessing(true);

    try {
      await createMovement.mutateAsync({
        productId: scannedProduct.id,
        storeId: storeId ? parseInt(storeId) : undefined,
        movementType,
        quantity: parseInt(quantity),
        reason,
        notes: notes || undefined,
      });

      toast.success(`${movementType === 'entry' ? 'Entrada' : 'Saída'} registrada com sucesso!`, {
        description: `${scannedProduct.name} - ${quantity} unidades`,
      });

      // Limpar formulário
      setBarcode('');
      setScannedProduct(null);
      setQuantity('1');
      setNotes('');
      
      // Atualizar lista de movimentações recentes
      refetchRecent();
      
      // Focar novamente no campo de código de barras
      setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, 100);
    } catch (error) {
      toast.error('Erro ao registrar movimentação', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Cancelar e limpar
  const handleCancel = () => {
    setBarcode('');
    setScannedProduct(null);
    setQuantity('1');
    setNotes('');
    barcodeInputRef.current?.focus();
  };

  // Formatar data
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Entrada/Saída Rápida</h2>
        <p className="text-gray-600">Use o leitor de código de barras ou QR Code para registrar movimentações</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Painel de Escaneamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scan className="w-5 h-5" />
              Escanear Produto
            </CardTitle>
            <CardDescription>
              Use o leitor de código de barras ou digite manualmente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Campo de código de barras */}
            <form onSubmit={handleBarcodeSubmit}>
              <div className="space-y-2">
                <Label htmlFor="barcode">Código de Barras / QR Code</Label>
                <div className="flex gap-2">
                  <Input
                    ref={barcodeInputRef}
                    id="barcode"
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="Escaneie ou digite o código..."
                    className="font-mono text-lg"
                    autoComplete="off"
                    disabled={isProcessing}
                  />
                  <Button type="submit" disabled={isProcessing || !barcode.trim()}>
                    <Scan className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  💡 Dica: Mantenha o cursor neste campo e escaneie o código
                </p>
              </div>
            </form>

            {/* Formulário de Cadastro Rápido */}
            {/* Debug: showQuickRegister = {String(showQuickRegister)} */}
            {showQuickRegister && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900">Cadastro Rápido de Produto</h3>
                    <p className="text-sm text-blue-700">EAN-13: {barcode}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="quickName">Nome do Produto *</Label>
                    <Input
                      id="quickName"
                      value={newProductData.name}
                      onChange={(e) => setNewProductData({ ...newProductData, name: e.target.value })}
                      placeholder="Ex: Arroz Bem Casado 5kg"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="quickPrice">Preço (R$) *</Label>
                      <Input
                        id="quickPrice"
                        type="number"
                        step="0.01"
                        value={newProductData.price}
                        onChange={(e) => setNewProductData({ ...newProductData, price: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="quickUnit">Unidade</Label>
                      <Input
                        id="quickUnit"
                        value={newProductData.unit}
                        onChange={(e) => setNewProductData({ ...newProductData, unit: e.target.value })}
                        placeholder="un, kg, cx"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="quickBrand">Marca</Label>
                      <Input
                        id="quickBrand"
                        value={newProductData.brand}
                        onChange={(e) => setNewProductData({ ...newProductData, brand: e.target.value })}
                        placeholder="Ex: Bem Casado"
                      />
                    </div>
                    <div>
                      <Label htmlFor="quickCategory">Categoria</Label>
                      <Input
                        id="quickCategory"
                        value={newProductData.category}
                        onChange={(e) => setNewProductData({ ...newProductData, category: e.target.value })}
                        placeholder="Ex: Grãos"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="quickInitialStock">Quantidade Inicial</Label>
                    <Input
                      id="quickInitialStock"
                      type="number"
                      min="0"
                      value={newProductData.initialStock}
                      onChange={(e) => setNewProductData({ ...newProductData, initialStock: e.target.value })}
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Deixe 0 para cadastrar sem estoque inicial
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleQuickRegister}
                    disabled={!newProductData.name || !newProductData.price}
                    className="flex-1"
                  >
                    Cadastrar Produto
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowQuickRegister(false);
                      setBarcode('');
                      setNewProductData({ name: '', price: '', brand: '', category: '', unit: 'un', initialStock: '0' });
                      barcodeInputRef.current?.focus();
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {/* Produto Escaneado */}
            {scannedProduct && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900">{scannedProduct.name}</h3>
                    <p className="text-sm text-green-700">{scannedProduct.brand}</p>
                    <div className="mt-2 flex items-center gap-4 text-sm">
                      <span className="text-green-600">
                        <Package className="w-4 h-4 inline mr-1" />
                        Estoque: {scannedProduct.stock}
                      </span>
                      <span className="text-green-600">
                        EAN: {scannedProduct.ean13}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Formulário de Movimentação */}
            {scannedProduct && (
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <Label>Tipo de Movimentação</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button
                      type="button"
                      variant={movementType === 'entry' ? 'default' : 'outline'}
                      className={movementType === 'entry' ? 'bg-green-600 hover:bg-green-700' : ''}
                      onClick={() => setMovementType('entry')}
                    >
                      <ArrowUpCircle className="w-4 h-4 mr-2" />
                      Entrada
                    </Button>
                    <Button
                      type="button"
                      variant={movementType === 'exit' ? 'default' : 'outline'}
                      className={movementType === 'exit' ? 'bg-red-600 hover:bg-red-700' : ''}
                      onClick={() => setMovementType('exit')}
                    >
                      <ArrowDownCircle className="w-4 h-4 mr-2" />
                      Saída
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="1"
                    className="text-lg font-semibold"
                  />
                </div>

                <div>
                  <Label htmlFor="store">Loja (opcional)</Label>
                  <select
                    id="store"
                    value={storeId}
                    onChange={(e) => setStoreId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Estoque geral</option>
                    {stores?.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="reason">Motivo</Label>
                  <select
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Selecione o motivo</option>
                    {movementType === 'entry' ? (
                      <>
                        <option value="purchase">Compra de fornecedor</option>
                        <option value="return">Devolução de cliente</option>
                        <option value="transfer_in">Transferência entre filiais</option>
                        <option value="other">Outro</option>
                      </>
                    ) : (
                      <>
                        <option value="sale">Venda</option>
                        <option value="loss">Perda/Quebra</option>
                        <option value="donation">Doação</option>
                        <option value="transfer_out">Transferência entre filiais</option>
                        <option value="expired">Produto vencido</option>
                        <option value="other">Outro</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <Label htmlFor="notes">Observações (opcional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Informações adicionais..."
                    rows={2}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleRegisterMovement}
                    disabled={isProcessing || !reason}
                    className="flex-1"
                  >
                    {isProcessing ? 'Processando...' : 'Registrar'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isProcessing}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Painel de Movimentações Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Movimentações Recentes</CardTitle>
            <CardDescription>Últimas 5 movimentações registradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentMovements && recentMovements.length > 0 ? (
                recentMovements.map((mov: any) => (
                  <div
                    key={mov.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    {mov.movementType === 'entry' ? (
                      <ArrowUpCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <ArrowDownCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{mov.productName}</p>
                      <p className="text-xs text-gray-600">{mov.storeName || 'Estoque geral'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-sm font-semibold ${
                            mov.quantity > 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {mov.quantity > 0 ? '+' : ''}{mov.quantity}
                        </span>
                        <span className="text-xs text-gray-500">{formatDate(mov.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <XCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma movimentação recente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instruções */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Como usar o leitor de código de barras</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>✅ <strong>Leitor USB:</strong> Conecte o leitor e escaneie diretamente (funciona como teclado)</p>
          <p>✅ <strong>Leitor Bluetooth:</strong> Pareie o dispositivo e escaneie</p>
          <p>✅ <strong>Câmera do celular:</strong> Use apps de leitura de QR Code e copie o código</p>
          <p>✅ <strong>Dica:</strong> Mantenha o cursor no campo "Código de Barras" para escanear rapidamente</p>
        </CardContent>
      </Card>
    </div>
  );
}
