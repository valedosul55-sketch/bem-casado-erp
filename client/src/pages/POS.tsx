import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Barcode, ShoppingCart, Trash2, Plus, Minus, DollarSign, CreditCard, Banknote, QrCode } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  stock: number;
}

export default function POS() {
  const [barcode, setBarcode] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cpfCliente, setCpfCliente] = useState("");
  const [emailCliente, setEmailCliente] = useState("");
  const [telefoneCliente, setTelefoneCliente] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("01"); // 01=Dinheiro por padrão
  const [selectedStoreId, setSelectedStoreId] = useState<number | undefined>(undefined);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // @ts-ignore - Types will be regenerated
  const { data: products } = trpc.products.list.useQuery();
  // @ts-ignore - Types will be regenerated
  const { data: stores } = trpc.system.getStores.useQuery();

  // Seleciona a primeira loja ativa por padrão
  useEffect(() => {
    if (stores && stores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(stores[0].id);
    }
  }, [stores]);

  // Auto-focus no input de código de barras
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!barcode.trim()) {
      toast.error("Digite um código de barras");
      return;
    }

    // Buscar produto por EAN-13
    const product = products?.find((p: any) => p.ean13 === barcode.trim());

    if (!product) {
      toast.error(`Produto não encontrado: ${barcode}`);
      setBarcode("");
      return;
    }

    if (!product.active) {
      toast.error("Produto inativo");
      setBarcode("");
      return;
    }

    if (product.stock <= 0) {
      toast.error("Produto sem estoque");
      setBarcode("");
      return;
    }

    // Adicionar ao carrinho
    addToCart(product);
    setBarcode("");
    barcodeInputRef.current?.focus();
  };

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      
      if (existing) {
        // Verificar se tem estoque
        if (existing.quantity >= product.stock) {
          toast.error("Estoque insuficiente");
          return prev;
        }
        
        toast.success(`${product.name} - Quantidade: ${existing.quantity + 1}`);
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      toast.success(`${product.name} adicionado ao carrinho`);
      return [...prev, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        stock: product.stock
      }];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.productId === productId) {
          const newQuantity = item.quantity + delta;
          
          if (newQuantity <= 0) {
            toast.info("Item removido");
            return null;
          }
          
          if (newQuantity > item.stock) {
            toast.error("Estoque insuficiente");
            return item;
          }
          
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
    toast.info("Item removido");
  };

  const clearCart = () => {
    setCart([]);
    toast.info("Carrinho limpo");
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // @ts-ignore - Types will be regenerated
  const emitirNFCeMutation = trpc.nfce.emitir.useMutation();

  const finalizeSale = async () => {
    console.log('🔵 finalizeSale chamada');
    console.log('🛒 Carrinho:', cart);
    
    if (cart.length === 0) {
      toast.error("Carrinho vazio");
      return;
    }

    try {
      console.log('🚀 Iniciando emissão de NFC-e...');
      toast.loading("Emitindo NFC-e...", { id: "nfce-loading" });

      // Buscar dados completos dos produtos
      const items = cart.map(item => {
        const product = products?.find((p: any) => p.id === item.productId);
        return {
          productId: item.productId,
          ean: product?.ean13 || '',
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        };
      });
      
      console.log('📦 Items preparados:', items);

      // Emitir NFC-e via Focus NFe
      console.log('📡 Chamando API do Focus NFe...');
        const result = await emitirNFCeMutation.mutateAsync({
        items,
        cliente: {
          nome: "CONSUMIDOR FINAL",
          cpf_cnpj: cpfCliente || undefined,
          email: emailCliente || undefined,
          telefone: telefoneCliente || undefined,
        },
        formaPagamento,
        storeId: selectedStoreId // Envia a loja selecionada
      });
      
      console.log('✅ Resposta da API:', result);

      toast.dismiss("nfce-loading");

      if (result.success && result.nota) {
        toast.success(
          `✅ NFC-e ${result.nota.numero} emitida com sucesso!\n` +
          `Chave: ${result.nota.chaveAcesso.substring(0, 20)}...\n` +
          `Total: R$ ${(calculateTotal() / 100).toFixed(2)}`,
          { duration: 10000 }
        );

        // Abrir DANFE em PDF (via Proxy do Backend)
        if (result.nota.chaveAcesso) {
          const pdfUrl = `/api/danfe-pdf/${result.nota.chaveAcesso}`;
          window.open(pdfUrl, '_blank');
        } else if (result.nota.urlDanfe) {
          // Fallback para HTML se não tiver chave
          window.open(result.nota.urlDanfe, '_blank');
        }

        // Abrir WhatsApp se link foi gerado
        if ((result as any).whatsappLink) {
          setTimeout(() => {
            window.open((result as any).whatsappLink, '_blank');
            toast.success('📱 WhatsApp aberto para enviar DANFE!');
          }, 1000);
        }

        clearCart();
        setCpfCliente("");
        setEmailCliente("");
        setTelefoneCliente("");
        
        // Recarregar lista de produtos para atualizar estoques
        setTimeout(() => window.location.reload(), 2000);
      } else {
        toast.error(`Erro ao emitir NFC-e: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Erro ao emitir NFC-e:', error);
      toast.dismiss("nfce-loading");
      toast.error(error instanceof Error ? error.message : "Erro ao emitir NFC-e");
    }
  };

  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingCart className="h-8 w-8 text-primary" />
              PDV - Ponto de Venda
            </h1>
            <p className="text-gray-600 mt-1">Loja de Fábrica Bem Casado</p>
          </div>
          
          <div className="w-full md:w-64">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Loja Emissora (Fiscal)</label>
            <Select 
              value={selectedStoreId?.toString()} 
              onValueChange={(val) => setSelectedStoreId(Number(val))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a loja" />
              </SelectTrigger>
              <SelectContent>
                {stores?.map((store: any) => (
                  <SelectItem key={store.id} value={store.id.toString()}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Esquerda - Scanner e Produtos */}
          <div className="lg:col-span-2 space-y-4">
            {/* Scanner de Código de Barras */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Barcode className="h-5 w-5" />
                  Leitor de Código de Barras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
                  <Input
                    ref={barcodeInputRef}
                    type="text"
                    placeholder="Escaneie ou digite o código EAN-13..."
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="flex-1 text-lg"
                    autoFocus
                  />
                  <Button type="submit" size="lg">
                    Adicionar
                  </Button>
                </form>
                <p className="text-sm text-gray-500 mt-2">
                  Use um leitor de código de barras USB/Bluetooth ou digite manualmente
                </p>
              </CardContent>
            </Card>

            {/* Lista de Produtos Disponíveis */}
            <Card>
              <CardHeader>
                <CardTitle>Produtos Disponíveis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {products?.filter((p: any) => p.active && p.stock > 0).map((product: any) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => addToCart(product)}
                    >
                      <div className="flex-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">EAN: {product.ean13}</p>
                        <p className="text-sm text-gray-500">Estoque: {product.stock} kits</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          R$ {(product.price / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna Direita - Carrinho */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Carrinho</span>
                  {cart.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearCart}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Limpar
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Carrinho vazio</p>
                    <p className="text-sm">Escaneie produtos para adicionar</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div key={item.productId} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-sm text-gray-600">
                              R$ {(item.price / 100).toFixed(2)} / kit
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.productId)}
                            className="text-red-600 hover:text-red-700 -mt-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.productId, -1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Badge variant="secondary" className="px-3">
                              {item.quantity}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.productId, 1)}
                              disabled={item.quantity >= item.stock}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="font-bold">
                            R$ {((item.price * item.quantity) / 100).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Forma de Pagamento e Dados do Cliente */}
            {cart.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Pagamento e Cliente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Forma de Pagamento</label>
                    <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="01">
                          <div className="flex items-center gap-2">
                            <Banknote className="h-4 w-4" /> Dinheiro
                          </div>
                        </SelectItem>
                        <SelectItem value="03">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" /> Cartão de Crédito
                          </div>
                        </SelectItem>
                        <SelectItem value="04">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" /> Cartão de Débito
                          </div>
                        </SelectItem>
                        <SelectItem value="17">
                          <div className="flex items-center gap-2">
                            <QrCode className="h-4 w-4" /> PIX
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div>
                    <label className="text-sm text-gray-600">CPF/CNPJ (Opcional)</label>
                    <Input
                      type="text"
                      placeholder="000.000.000-00"
                      value={cpfCliente}
                      onChange={(e) => setCpfCliente(e.target.value)}
                      maxLength={14}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Email (para envio do DANFE)</label>
                    <Input
                      type="email"
                      placeholder="cliente@email.com"
                      value={emailCliente}
                      onChange={(e) => setEmailCliente(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">WhatsApp (para envio do DANFE)</label>
                    <Input
                      type="tel"
                      placeholder="(12) 98765-4321"
                      value={telefoneCliente}
                      onChange={(e) => setTelefoneCliente(e.target.value)}
                      maxLength={15}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Total e Finalizar */}
            {cart.length > 0 && (
              <Card className="bg-primary text-white">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-lg">
                      <span>Subtotal:</span>
                      <span className="font-bold">R$ {(total / 100).toFixed(2)}</span>
                    </div>
                    <Separator className="bg-white/20" />
                    <div className="flex items-center justify-between text-2xl font-bold">
                      <span>TOTAL:</span>
                      <span>R$ {(total / 100).toFixed(2)}</span>
                    </div>
                    <Button
                      size="lg"
                      className="w-full bg-white text-primary hover:bg-gray-100"
                      onClick={finalizeSale}
                    >
                      <DollarSign className="h-5 w-5 mr-2" />
                      Finalizar Venda
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
