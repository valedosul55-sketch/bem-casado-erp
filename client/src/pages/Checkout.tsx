import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import { CreditCard, Smartphone, Ticket, Loader2, ShoppingBag, Copy, Check, Clock, AlertCircle, Shield, FileText, Download, ExternalLink, CheckCircle2, QrCode } from 'lucide-react';
import { VisaIcon, MastercardIcon, EloIcon, AmexIcon, HipercardIcon, PixIcon, AleloIcon, SodexoIcon, TicketIcon, VRIcon, IFoodIcon } from '@/components/PaymentIcons';
import { 
  validateCardNumber, 
  validateExpiryDate, 
  validateCVV, 
  validateCardHolderName,
  detectCardBrand,
  formatCardNumber,
  formatExpiryDate,
  detectFraudPatterns,
  type CardBrand
} from '@/lib/cardValidation';
import { 
  validateDocument,
  formatDocument,
  cleanDocument,
  getDocumentType
} from '@/lib/documentValidation';

export default function Checkout() {
  const { items, getTotalPrice, getSubtotal, getDiscount, coupon, clearCart } = useCart();
  const [, setLocation] = useLocation();
  
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerDocument, setCustomerDocument] = useState(''); // CPF ou CNPJ
  const [documentError, setDocumentError] = useState('');
  const [inscricaoEstadual, setInscricaoEstadual] = useState(''); // IE
  const [ieError, setIeError] = useState('');
  const [razaoSocial, setRazaoSocial] = useState(''); // Razão Social (CNPJ)
  const [uf, setUf] = useState(''); // UF (estado)
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [cnpjAutoFilled, setCnpjAutoFilled] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'debit_card' | 'pix' | 'food_voucher'>('credit_card');
  
  // Dados do cartão
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardBrand, setCardBrand] = useState<CardBrand>('unknown');
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const [paymentAttempts, setPaymentAttempts] = useState(0);
  const [firstAttemptTime, setFirstAttemptTime] = useState<number | null>(null);

  // Dados do PIX
  const [pixData, setPixData] = useState<{ pixPayload: string; qrCodeUrl: string; orderId: number } | null>(null);
  const [showPixPayment, setShowPixPayment] = useState(false);
  const [pixTimeLeft, setPixTimeLeft] = useState(10 * 60); // 10 minutos em segundos
  const [pixExpired, setPixExpired] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);

  // Dados da NFC-e
  const [nfceData, setNfceData] = useState<{
    numero: string;
    serie: string;
    chaveAcesso: string;
    urlDanfe: string;
    urlXml: string;
    qrcodeUrl: string;
  } | null>(null);
  const [showNfceSuccess, setShowNfceSuccess] = useState(false);

  const createOrderMutation = trpc.orders.create.useMutation();
  const processPaymentMutation = trpc.orders.processPayment.useMutation();
  const generatePixMutation = trpc.orders.generatePix.useMutation();
  const confirmPaymentMutation = trpc.orders.confirmPayment.useMutation();
  const consultarCNPJQuery = trpc.orders.consultarCNPJ.useQuery(
    { cnpj: customerDocument },
    { enabled: false } // Não executa automaticamente
  );

  // Timer do PIX (10 minutos)
  useEffect(() => {
    if (!showPixPayment || pixExpired) return;

    const timer = setInterval(() => {
      setPixTimeLeft((prev) => {
        if (prev <= 1) {
          setPixExpired(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showPixPayment, pixExpired]);

  // Formatar tempo restante (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Copiar código PIX
  const copyPixCode = () => {
    if (pixData?.pixPayload) {
      navigator.clipboard.writeText(pixData.pixPayload);
      setPixCopied(true);
      toast.success('Código PIX copiado!', {
        description: 'Cole no seu aplicativo bancário para pagar.',
      });
      setTimeout(() => setPixCopied(false), 3000);
    }
  };

  // Handler para número do cartão com formatação e detecção de bandeira
  const handleCardNumberChange = (value: string) => {
    // Remove caracteres não numéricos
    const cleaned = value.replace(/\D/g, '');
    
    // Limita a 16 dígitos (19 para alguns cartões)
    const limited = cleaned.substring(0, 19);
    
    // Formata com espaços
    const formatted = formatCardNumber(limited);
    setCardNumber(formatted);
    
    // Detecta bandeira automaticamente
    const brand = detectCardBrand(limited);
    setCardBrand(brand);
    
    // Limpa erro se houver
    if (cardErrors.cardNumber && limited.length >= 13) {
      const isValid = validateCardNumber(limited);
      if (isValid) {
        const { ["cardNumber"]: _, ...rest } = cardErrors;
        setCardErrors(rest);
      }
    }
  };

  // Handler para data de validade com formatação MM/AA
  const handleExpiryChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const limited = cleaned.substring(0, 4);
    const formatted = formatExpiryDate(limited);
    setCardExpiry(formatted);
    
    // Valida em tempo real se tiver 4 dígitos
    if (limited.length === 4) {
      const validation = validateExpiryDate(formatted);
      if (validation.valid) {
        const { ["cardExpiry"]: _, ...rest } = cardErrors;
        setCardErrors(rest);
      } else {
        setCardErrors({ ...cardErrors, cardExpiry: validation.message || 'Data inválida' });
      }
    }
  };

  // Handler para CVV
  const handleCvvChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const maxLength = cardBrand === 'amex' ? 4 : 3;
    const limited = cleaned.substring(0, maxLength);
    setCardCvv(limited);
    
    // Valida em tempo real
    if (limited.length === maxLength) {
      const validation = validateCVV(limited, cardBrand);
      if (validation.valid) {
        const { ["cardCvv"]: _, ...rest } = cardErrors;
        setCardErrors(rest);
      }
    }
  };

  // Handler para nome no cartão
  const handleCardHolderChange = (value: string) => {
    // Apenas letras maiúsculas e espaços
    const cleaned = value.toUpperCase().replace(/[^A-Z\s]/g, '');
    const limited = cleaned.substring(0, 26);
    setCardHolderName(limited);
    
    // Valida em tempo real
    if (limited.length >= 3) {
      const validation = validateCardHolderName(limited);
      if (validation.valid) {
        const { ["cardHolderName"]: _, ...rest } = cardErrors;
        setCardErrors(rest);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error('Carrinho vazio', {
        description: 'Adicione produtos ao carrinho antes de finalizar.',
      });
      return;
    }

    if (!customerName || !customerPhone) {
      toast.error('Dados incompletos', {
        description: 'Preencha nome e telefone para continuar.',
      });
      return;
    }

    // Validações de segurança para pagamento com cartão
    if (paymentMethod === 'credit_card' || paymentMethod === 'debit_card' || paymentMethod === 'food_voucher') {
      if (!cardNumber || !cardHolderName || !cardExpiry || !cardCvv) {
        toast.error('Dados do cartão incompletos', {
          description: 'Preencha todos os dados do cartão.',
        });
        return;
      }

      // Validação do número do cartão (Algoritmo de Luhn)
      if (!validateCardNumber(cardNumber)) {
        toast.error('Cartão inválido', {
          description: 'O número do cartão é inválido. Verifique e tente novamente.',
        });
        setCardErrors({ ...cardErrors, cardNumber: 'Número inválido' });
        return;
      }

      // Validação do nome
      const nameValidation = validateCardHolderName(cardHolderName);
      if (!nameValidation.valid) {
        toast.error('Nome inválido', {
          description: nameValidation.message,
        });
        setCardErrors({ ...cardErrors, cardHolderName: nameValidation.message || 'Nome inválido' });
        return;
      }

      // Validação da data de validade
      const expiryValidation = validateExpiryDate(cardExpiry);
      if (!expiryValidation.valid) {
        toast.error('Data de validade inválida', {
          description: expiryValidation.message,
        });
        setCardErrors({ ...cardErrors, cardExpiry: expiryValidation.message || 'Data inválida' });
        return;
      }

      // Validação do CVV
      const cvvValidation = validateCVV(cardCvv, cardBrand);
      if (!cvvValidation.valid) {
        toast.error('CVV inválido', {
          description: cvvValidation.message,
        });
        setCardErrors({ ...cardErrors, cardCvv: cvvValidation.message || 'CVV inválido' });
        return;
      }

      // Detecção de padrões de fraude
      const now = Date.now();
      const timeWindow = firstAttemptTime ? (now - firstAttemptTime) / 1000 : 0;
      
      const fraudCheck = detectFraudPatterns({
        cardNumber,
        attempts: paymentAttempts + 1,
        timeWindow,
      });

      if (fraudCheck.suspicious) {
        toast.error('Transação bloqueada', {
          description: 'Detectamos atividade suspeita. Entre em contato conosco.',
          duration: 5000,
        });
        console.warn('[SECURITY] Fraude detectada:', fraudCheck.reasons);
        return;
      }

      // Registrar tentativa
      if (!firstAttemptTime) {
        setFirstAttemptTime(now);
      }
      setPaymentAttempts(prev => prev + 1);

      // Rate limiting: máximo 5 tentativas em 5 minutos
      if (paymentAttempts >= 5 && timeWindow < 300) {
        toast.error('Muitas tentativas', {
          description: 'Aguarde alguns minutos antes de tentar novamente.',
          duration: 5000,
        });
        return;
      }
    }

    try {
      toast.loading('Processando pedido...', { id: 'checkout' });

      // Criar pedido
      const orderResult = await createOrderMutation.mutateAsync({
        customerName,
        customerEmail: customerEmail || undefined,
        customerPhone,
        items: items.map(item => ({
          productName: item.product.name,
          productBrand: item.product.brand,
          quantity: item.quantity,
          unitPrice: Math.round(item.product.price * 100), // converter para centavos
        })),
        paymentMethod,
        couponCode: coupon?.code,
      });

      // Se for PIX, gerar QR Code e mostrar modal
      if (paymentMethod === 'pix') {
        // @ts-ignore - Tipo será atualizado após regeneração do tRPC
        const pixResult = await generatePixMutation.mutateAsync({
          orderId: orderResult.orderId,
          amount: getTotalPrice(),
          // @ts-ignore
          customerEmail: customerEmail || undefined,
        });
        
        setPixData({
          ...pixResult,
          orderId: orderResult.orderId,
        });
        setShowPixPayment(true);
        setPixTimeLeft(10 * 60); // Reset timer para 10 minutos
        setPixExpired(false);
        
        toast.dismiss('checkout');
        toast.success('PIX gerado com sucesso!', {
          description: 'Escaneie o QR Code ou copie o código para pagar.',
        });
        return;
      }

      // Processar pagamento para outros métodos
      const [expiryMonth, expiryYear] = cardExpiry.split('/');
      const paymentResult = await processPaymentMutation.mutateAsync({
        orderId: orderResult.orderId,
        paymentMethod,
        cardNumber: paymentMethod === 'credit_card' || paymentMethod === 'debit_card' ? cardNumber.replace(/\s/g, '') : undefined,
        cardHolderName: paymentMethod === 'credit_card' || paymentMethod === 'debit_card' ? cardHolderName : undefined,
        cardExpiryMonth: paymentMethod === 'credit_card' || paymentMethod === 'debit_card' ? expiryMonth : undefined,
        cardExpiryYear: paymentMethod === 'credit_card' || paymentMethod === 'debit_card' ? `20${expiryYear}` : undefined,
        cardCvv: paymentMethod === 'credit_card' || paymentMethod === 'debit_card' ? cardCvv : undefined,
        // Dados do cliente para NFC-e
        customerEmail: customerEmail || undefined,
        customerCpfCnpj: customerDocument ? cleanDocument(customerDocument) : undefined,
        inscricaoEstadual: inscricaoEstadual || undefined,
        razaoSocial: razaoSocial || undefined,
        uf: uf || undefined,
      });

      toast.dismiss('checkout');

      if (paymentResult.success) {
        // Se NFC-e foi emitida, exibe modal de sucesso
        if (paymentResult.nfce) {
          setNfceData(paymentResult.nfce);
          setShowNfceSuccess(true);
          clearCart();
        } else {
          // Sem NFC-e, apenas mostra sucesso e redireciona
          toast.success('Pagamento aprovado!', {
            description: `Pedido #${orderResult.orderId} confirmado.`,
          });
          clearCart();
          setLocation(`/order-confirmation/${orderResult.orderId}`);
        }
      } else {
        toast.error('Pagamento recusado', {
          description: paymentResult.message || 'Tente novamente ou use outro método de pagamento.',
        });
      }
    } catch (error) {
      toast.dismiss('checkout');
      toast.error('Erro ao processar pedido', {
        description: error instanceof Error ? error.message : 'Tente novamente mais tarde.',
      });
    }
  };

  const handleNewOrder = () => {
    setShowPixPayment(false);
    setPixData(null);
    setPixExpired(false);
    setPixTimeLeft(10 * 60);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <CardTitle>Carrinho Vazio</CardTitle>
            <CardDescription>Adicione produtos ao carrinho para finalizar a compra</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation('/')} className="w-full">
              Voltar para a loja
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container max-w-6xl">
          <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Formulário de checkout */}
            <div className="md:col-span-2 space-y-6">
              {/* Dados do cliente */}
              <Card>
                <CardHeader>
                  <CardTitle>Dados do Cliente</CardTitle>
                  <CardDescription>Preencha seus dados para contato</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome completo *</Label>
                    <Input
                      id="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="João Silva"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail {paymentMethod === 'pix' && '*'}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="joao@exemplo.com"
                      required={paymentMethod === 'pix'}
                    />
                    {paymentMethod === 'pix' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Obrigatório para receber o QR Code por email
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                    <Input
                      id="phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="(12) 99999-9999"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="document">
                      CPF ou CNPJ (opcional) {cnpjLoading && '- Consultando...'}
                    </Label>
                    <div className="relative">
                    <Input
                      id="document"
                      value={customerDocument}
                      disabled={cnpjLoading}
                      onChange={async (e) => {
                        const formatted = formatDocument(e.target.value);
                        setCustomerDocument(formatted);
                        const cleaned = cleanDocument(formatted);
                        
                        // Limpa dados preenchidos automaticamente se usuário mudar CNPJ
                        if (cnpjAutoFilled) {
                          setRazaoSocial('');
                          setInscricaoEstadual('');
                          setUf('');
                          setCnpjAutoFilled(false);
                        }
                        
                        // Valida se tem conteúdo
                        if (formatted && cleaned.length >= 11) {
                          if (validateDocument(formatted)) {
                            setDocumentError('');
                            
                            // Se for CNPJ válido com 14 dígitos, consulta automaticamente
                            if (cleaned.length === 14) {
                              setCnpjLoading(true);
                              try {
                                const resultado = await consultarCNPJQuery.refetch();
                                
                                if (resultado.data?.success && resultado.data.dados) {
                                  const { razaoSocial: rs, uf: estado, inscricaoEstadual: ie } = resultado.data.dados;
                                  
                                  setRazaoSocial(rs || '');
                                  setUf(estado || '');
                                  if (ie) {
                                    setInscricaoEstadual(ie);
                                  }
                                  setCnpjAutoFilled(true);
                                  
                                  toast.success('Dados da empresa carregados!', {
                                    description: rs,
                                  });
                                } else {
                                  toast.info('CNPJ não encontrado', {
                                    description: 'Preencha os dados manualmente.',
                                  });
                                }
                              } catch (error) {
                                console.error('Erro ao consultar CNPJ:', error);
                                toast.error('Erro ao consultar CNPJ', {
                                  description: 'Preencha os dados manualmente.',
                                });
                              } finally {
                                setCnpjLoading(false);
                              }
                            }
                          } else {
                            const type = getDocumentType(formatted);
                            setDocumentError(`${type === 'cpf' ? 'CPF' : 'CNPJ'} inválido`);
                          }
                        } else {
                          setDocumentError('');
                        }
                      }}
                      placeholder="000.000.000-00 ou 00.000.000/0000-00"
                      maxLength={18}
                      className={documentError ? 'border-red-500' : ''}
                    />
                    {documentError && (
                      <p className="text-xs text-red-500 mt-1">{documentError}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Informe para incluir na nota fiscal. CNPJ contribuinte recebe desconto de ICMS.
                    </p>
                    </div>
                  </div>
                  {/* Campos para CNPJ - aparecem apenas quando CNPJ for detectado */}
                  {customerDocument && getDocumentType(customerDocument) === 'cnpj' && (
                    <>
                      {/* Campo Razão Social */}
                      <div>
                        <Label htmlFor="razaoSocial">
                          Razão Social {cnpjLoading && '(carregando...)'}
                        </Label>
                        <Input
                          id="razaoSocial"
                          value={razaoSocial}
                          onChange={(e) => setRazaoSocial(e.target.value)}
                          placeholder="Nome da Empresa Ltda"
                          disabled={cnpjLoading}
                          className={cnpjAutoFilled ? 'bg-green-50' : ''}
                        />
                        {cnpjAutoFilled && (
                          <p className="text-xs text-green-600 mt-1">
                            ✓ Preenchido automaticamente
                          </p>
                        )}
                      </div>
                      
                      {/* Campo UF */}
                      <div>
                        <Label htmlFor="uf">
                          Estado (UF) {cnpjLoading && '(carregando...)'}
                        </Label>
                        <Input
                          id="uf"
                          value={uf}
                          onChange={(e) => setUf(e.target.value.toUpperCase())}
                          placeholder="SP"
                          maxLength={2}
                          disabled={cnpjLoading}
                          className={cnpjAutoFilled ? 'bg-green-50' : ''}
                        />
                        {cnpjAutoFilled && (
                          <p className="text-xs text-green-600 mt-1">
                            ✓ Preenchido automaticamente
                          </p>
                        )}
                      </div>
                      
                      {/* Campo Inscrição Estadual */}
                    <div>
                      <Label htmlFor="ie">Inscrição Estadual (opcional)</Label>
                      <Input
                        id="ie"
                        value={inscricaoEstadual}
                        onChange={(e) => {
                          // Remove caracteres não numéricos
                          const cleaned = e.target.value.replace(/\D/g, '');
                          // Limita a 14 dígitos (máximo para IE)
                          const limited = cleaned.substring(0, 14);
                          setInscricaoEstadual(limited);
                          
                          // Valida formato (9-14 dígitos)
                          if (limited.length > 0 && (limited.length < 9 || limited.length > 14)) {
                            setIeError('IE deve ter entre 9 e 14 dígitos');
                          } else {
                            setIeError('');
                          }
                        }}
                        placeholder="123456789"
                        maxLength={14}
                        className={ieError ? 'border-red-500' : ''}
                      />
                      {ieError && (
                        <p className="text-xs text-red-500 mt-1">{ieError}</p>
                      )}
                      <p className="text-xs text-green-600 mt-1">
                        ✓ Empresas contribuintes com IE recebem desconto de ICMS (base reduzida 7%)
                      </p>
                    </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Método de pagamento */}
              <Card>
                <CardHeader>
                  <CardTitle>Método de Pagamento</CardTitle>
                  <CardDescription>Escolha como deseja pagar</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="credit_card" id="card" />
                      <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                        <CreditCard className="h-5 w-5" />
                        <span>Cartão de Crédito/Débito</span>
                      </Label>
                      <div className="flex gap-1.5">
                        <VisaIcon className="h-8" />
                        <MastercardIcon className="h-8" />
                        <EloIcon className="h-8" />
                        <HipercardIcon className="h-8" />
                        <AmexIcon className="h-8" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="food_voucher" id="voucher" />
                      <Label htmlFor="voucher" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Ticket className="h-5 w-5" />
                        <span>Vale Alimentação</span>
                      </Label>
                      <div className="flex gap-1.5">
                        <AleloIcon className="h-8" />
                        <SodexoIcon className="h-8" />
                        <TicketIcon className="h-8" />
                        <VRIcon className="h-8" />
                        <IFoodIcon className="h-8" />
                      </div>
                    </div>
                    {/* PIX temporariamente desabilitado até o lançamento oficial */}
                    {/* <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 bg-green-50 border-green-200">
                      <RadioGroupItem value="pix" id="pix" />
                      <Label htmlFor="pix" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Smartphone className="h-5 w-5 text-green-600" />
                        <div className="flex-1">
                          <span className="font-medium">PIX</span>
                          <p className="text-xs text-gray-500">Aprovação instantânea</p>
                        </div>
                      </Label>
                      <PixIcon className="h-10" />
                    </div> */}
                  </RadioGroup>

                  {/* Dados do cartão */}
                  {(paymentMethod === 'credit_card' || paymentMethod === 'debit_card' || paymentMethod === 'food_voucher') && (
                    <div className="mt-6 space-y-4">
                      <Separator />
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Dados do Cartão</h3>
                        <div className="flex items-center gap-2 text-xs text-green-600">
                          <Shield className="h-4 w-4" />
                          <span>Conexão Segura</span>
                        </div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-800">
                          <strong>🔒 Seus dados estão protegidos:</strong> Usamos criptografia de ponta a ponta e nunca armazenamos informações completas do seu cartão. Processamento seguro via SafraPay.
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="cardNumber">Número do cartão *</Label>
                        <div className="relative">
                          <Input
                            id="cardNumber"
                            value={cardNumber}
                            onChange={(e) => handleCardNumberChange(e.target.value)}
                            placeholder="1234 5678 9012 3456"
                            maxLength={23}
                            required
                            className={cardErrors.cardNumber ? 'border-red-500' : ''}
                          />
                          {cardBrand !== 'unknown' && cardNumber.length > 0 && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              {cardBrand === 'visa' && <VisaIcon className="h-6" />}
                              {cardBrand === 'mastercard' && <MastercardIcon className="h-6" />}
                              {cardBrand === 'elo' && <EloIcon className="h-6" />}
                              {cardBrand === 'amex' && <AmexIcon className="h-6" />}
                              {cardBrand === 'hipercard' && <HipercardIcon className="h-6" />}
                            </div>
                          )}
                        </div>
                        {cardErrors.cardNumber && (
                          <p className="text-xs text-red-500 mt-1">{cardErrors.cardNumber}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="cardHolder">Nome no cartão *</Label>
                        <Input
                          id="cardHolder"
                          value={cardHolderName}
                          onChange={(e) => handleCardHolderChange(e.target.value)}
                          placeholder="JOÃO SILVA"
                          maxLength={26}
                          required
                          className={cardErrors.cardHolderName ? 'border-red-500' : ''}
                        />
                        {cardErrors.cardHolderName && (
                          <p className="text-xs text-red-500 mt-1">{cardErrors.cardHolderName}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Digite exatamente como está no cartão</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cardExpiry">Validade *</Label>
                          <Input
                            id="cardExpiry"
                            value={cardExpiry}
                            onChange={(e) => handleExpiryChange(e.target.value)}
                            placeholder="MM/AA"
                            maxLength={5}
                            required
                            className={cardErrors.cardExpiry ? 'border-red-500' : ''}
                          />
                          {cardErrors.cardExpiry && (
                            <p className="text-xs text-red-500 mt-1">{cardErrors.cardExpiry}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="cardCvv" className="flex items-center gap-1">
                            CVV *
                            <Shield className="h-3 w-3 text-green-600" />
                          </Label>
                          <Input
                            id="cardCvv"
                            value={cardCvv}
                            onChange={(e) => handleCvvChange(e.target.value)}
                            placeholder={cardBrand === 'amex' ? '1234' : '123'}
                            maxLength={cardBrand === 'amex' ? 4 : 3}
                            type="password"
                            required
                            className={cardErrors.cardCvv ? 'border-red-500' : ''}
                          />
                          {cardErrors.cardCvv && (
                            <p className="text-xs text-red-500 mt-1">{cardErrors.cardCvv}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {cardBrand === 'amex' ? '4 dígitos na frente' : '3 dígitos no verso'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Resumo do pedido */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.quantity}x {item.product.name}
                      </span>
                      <span className="font-medium">
                        R$ {(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>R$ {getSubtotal().toFixed(2)}</span>
                    </div>
                    
                    {coupon && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Desconto ({coupon.code})</span>
                        <span>-R$ {getDiscount().toFixed(2)}</span>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">R$ {getTotalPrice().toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    className="w-full"
                    size="lg"
                    disabled={createOrderMutation.isPending || processPaymentMutation.isPending || generatePixMutation.isPending}
                  >
                    {createOrderMutation.isPending || processPaymentMutation.isPending || generatePixMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      'Finalizar Compra'
                    )}
                  </Button>

                  <p className="text-xs text-center text-gray-500">
                    Pagamento seguro via SafraPay
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Modal do PIX */}
      <Dialog open={showPixPayment} onOpenChange={setShowPixPayment}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-green-600" />
              Pagamento via PIX
            </DialogTitle>
            <DialogDescription>
              {pixExpired 
                ? 'O tempo para pagamento expirou. Gere um novo pedido.'
                : 'Escaneie o QR Code ou copie o código para pagar'}
            </DialogDescription>
          </DialogHeader>

          {!pixExpired ? (
            <div className="space-y-4">
              {/* Timer */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900">Tempo restante</p>
                  <p className="text-2xl font-bold text-yellow-700">{formatTime(pixTimeLeft)}</p>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex justify-center p-4 bg-white border rounded-lg">
                {pixData?.qrCodeUrl && (
                  <img 
                    src={pixData.qrCodeUrl} 
                    alt="QR Code PIX" 
                    className="w-64 h-64"
                  />
                )}
              </div>

              {/* Código Copia e Cola */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Código PIX (Copia e Cola)</Label>
                <div className="flex gap-2">
                  <Input
                    value={pixData?.pixPayload || ''}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    onClick={copyPixCode}
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                  >
                    {pixCopied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Instruções */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-sm text-blue-900 mb-2">Como pagar:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Abra o app do seu banco</li>
                  <li>Escolha pagar com PIX</li>
                  <li>Escaneie o QR Code ou cole o código</li>
                  <li>Confirme o pagamento</li>
                </ol>
              </div>

              {/* Info do pedido */}
              <div className="text-center text-sm text-gray-600">
                <p>Pedido #{pixData?.orderId}</p>
                <p className="font-bold text-lg text-primary">R$ {getTotalPrice().toFixed(2)}</p>
              </div>

              {/* Botão de confirmação */}
              <Button
                onClick={async () => {
                  if (!pixData) return;
                  try {
                    const result = await confirmPaymentMutation.mutateAsync({
                      orderId: pixData.orderId,
                      customerEmail: customerEmail || undefined,
                      customerCpfCnpj: customerDocument ? cleanDocument(customerDocument) : undefined,
                      inscricaoEstadual: inscricaoEstadual || undefined,
                      razaoSocial: razaoSocial || undefined,
                      uf: uf || undefined,
                    });
                    
                    if (result.success) {
                      setShowPixPayment(false);
                      
                      if (result.nfce) {
                        setNfceData(result.nfce);
                        setShowNfceSuccess(true);
                        toast.success('Pagamento confirmado e NFC-e emitida!');
                      } else {
                        toast.success('Pagamento confirmado!');
                      }
                      
                      clearCart();
                    }
                  } catch (error) {
                    console.error('Erro ao confirmar pagamento:', error);
                    toast.error('Erro ao confirmar pagamento');
                  }
                }}
                className="w-full"
                disabled={confirmPaymentMutation.isPending}
              >
                {confirmPaymentMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Confirmando...
                  </>
                ) : (
                  'Já Paguei - Confirmar Pagamento'
                )}
              </Button>

              <p className="text-xs text-center text-gray-500">
                Clique após realizar o pagamento no seu banco
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-3" />
                <h4 className="font-semibold text-red-900 mb-2">Tempo Expirado</h4>
                <p className="text-sm text-red-700">
                  O prazo de 10 minutos para pagamento expirou. 
                  Gere um novo pedido para continuar.
                </p>
              </div>

              <Button onClick={handleNewOrder} className="w-full">
                Gerar Novo Pedido
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Sucesso - NFC-e Emitida */}
      <Dialog open={showNfceSuccess} onOpenChange={setShowNfceSuccess}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              Nota Fiscal Emitida com Sucesso!
            </DialogTitle>
            <DialogDescription>
              Sua NFC-e foi autorizada pela SEFAZ-SP. Baixe o XML ou visualize o DANFE.
            </DialogDescription>
          </DialogHeader>

          {nfceData && (
            <div className="space-y-4">
              {/* Info da Nota */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Número:</span>
                    <span className="font-semibold">{nfceData.numero}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Série:</span>
                    <span className="font-semibold">{nfceData.serie}</span>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-gray-600 block mb-1">Chave de Acesso:</span>
                    <code className="text-xs bg-white p-2 rounded border block break-all">
                      {nfceData.chaveAcesso}
                    </code>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              {nfceData.qrcodeUrl && (
                <div className="flex flex-col items-center gap-2">
                  <Label className="text-sm font-medium">Consulte na SEFAZ-SP</Label>
                  <div className="p-3 bg-white border rounded-lg">
                    <img 
                      src={nfceData.qrcodeUrl} 
                      alt="QR Code NFC-e" 
                      className="w-48 h-48"
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Escaneie para consultar a nota no site da SEFAZ
                  </p>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => {
                    if (nfceData.urlXml) {
                      window.open(nfceData.urlXml, '_blank');
                      toast.success('Abrindo XML da nota fiscal...');
                    } else {
                      toast.error('URL do XML não disponível');
                    }
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Baixar XML
                </Button>

                <Button
                  onClick={() => {
                    if (nfceData.urlDanfe) {
                      window.open(nfceData.urlDanfe, '_blank');
                      toast.success('Abrindo DANFE...');
                    } else {
                      toast.error('URL do DANFE não disponível');
                    }
                  }}
                  variant="default"
                  className="w-full"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visualizar DANFE
                </Button>
              </div>

              {/* Aviso sobre Email */}
              {customerEmail && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-900">
                    <FileText className="inline h-4 w-4 mr-1" />
                    O DANFE também foi enviado para <strong>{customerEmail}</strong>
                  </p>
                </div>
              )}

              {/* Botão Fechar */}
              <Button
                onClick={() => {
                  setShowNfceSuccess(false);
                  setLocation('/');
                }}
                className="w-full"
                variant="outline"
              >
                Voltar para Loja
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
