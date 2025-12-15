import { useState } from 'react';
import { Mail, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setIsSubscribed(true);

        // Mostrar toast com cupom
        if (data.couponCode && !data.alreadySubscribed) {
          toast.success(
            <div className="flex flex-col gap-2">
              <p className="font-semibold">Cadastro realizado com sucesso!</p>
              <p className="text-sm">Seu cupom exclusivo: <span className="font-bold text-primary">{data.couponCode}</span></p>
              <p className="text-xs text-muted-foreground">5% de desconto em compras acima de R$ 30</p>
              <p className="text-xs text-muted-foreground mt-1">✉️ Você receberá um email de boas-vindas em breve!</p>
            </div>,
            {
              duration: 10000,
            }
          );

          // Copiar cupom para área de transferência
          navigator.clipboard.writeText(data.couponCode);
        } else if (data.alreadySubscribed) {
          toast.info(data.message);
        }

        // Resetar após 3 segundos
        setTimeout(() => {
          setEmail('');
          setIsSubscribed(false);
        }, 3000);
      } else {
        toast.error(data.message);
      }
    },
    onError: (error) => {
      console.error('Erro ao cadastrar newsletter:', error);
      toast.error('Erro ao cadastrar. Por favor, tente novamente mais tarde.');
    },
  });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value) {
      setIsValid(validateEmail(value));
    } else {
      setIsValid(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Por favor, digite seu email');
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Por favor, digite um email válido');
      return;
    }

    // Chamar API do Mailchimp
    subscribeMutation.mutate({ email });
  };

  const isSubmitting = subscribeMutation.isPending;

  return (
    <div className="bg-gradient-to-r from-primary to-red-700 text-white py-12">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Mail className="h-10 w-10" />
            <h2 className="text-3xl font-bold">Receba Ofertas Exclusivas</h2>
          </div>
          <p className="text-lg mb-8 opacity-90">
            Cadastre-se na nossa newsletter e ganhe <span className="font-bold text-yellow-300">5% de desconto</span> na
            sua primeira compra!
          </p>

          {!isSubscribed ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <div className="flex-1 relative">
                <Input
                  type="email"
                  placeholder="Digite seu melhor email"
                  value={email}
                  onChange={handleEmailChange}
                  className={`h-12 bg-white text-gray-900 placeholder:text-gray-500 ${
                    !isValid ? 'border-red-500 focus-visible:ring-red-500' : ''
                  }`}
                  disabled={isSubmitting}
                />
                {!isValid && email && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting || !email || !isValid}
                className="bg-white text-primary hover:bg-gray-100 font-bold h-12 px-8"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  'Ganhar Cupom'
                )}
              </Button>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-3 bg-white/20 backdrop-blur-sm rounded-lg p-6 max-w-xl mx-auto animate-in fade-in zoom-in duration-500">
              <div className="bg-green-500 rounded-full p-2">
                <Check className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="font-bold text-lg">Cadastro realizado!</p>
                <p className="text-sm opacity-90">Cupom NEWSLETTER5 copiado para área de transferência</p>
                <p className="text-xs opacity-75 mt-1">✉️ Verifique seu email em breve!</p>
              </div>
            </div>
          )}

          {!isValid && email && (
            <p className="text-sm text-yellow-300 mt-2 flex items-center justify-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Por favor, digite um email válido
            </p>
          )}

          <p className="text-xs opacity-75 mt-6">
            Ao se cadastrar, você concorda em receber emails promocionais da Bem Casado. Você pode cancelar a qualquer
            momento.
          </p>
        </div>
      </div>
    </div>
  );
}
