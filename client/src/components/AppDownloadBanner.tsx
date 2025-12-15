import { Download, X, Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function AppDownloadBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Verificar se usuário já fechou o banner antes
    const dismissed = localStorage.getItem('app-download-banner-dismissed');
    if (dismissed === 'true') {
      return;
    }

    // Verificar se já está instalado (modo standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      return;
    }

    // Mostrar banner sempre (não depende de beforeinstallprompt)
    setShowBanner(true);

    // Capturar evento beforeinstallprompt se disponível
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Se tiver o prompt nativo, usar
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('Usuário aceitou instalar o PWA');
        setShowBanner(false);
      }
      
      setDeferredPrompt(null);
    } else {
      // Caso contrário, mostrar instruções
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      let message = '';
      
      if (isIOS) {
        message = 'Para instalar:\n\n1. Toque no botão Compartilhar (□↑)\n2. Selecione "Adicionar à Tela de Início"\n3. Toque em "Adicionar"';
      } else if (isAndroid) {
        message = 'Para instalar:\n\n1. Toque nos 3 pontinhos (⋮) no menu\n2. Selecione "Adicionar à tela inicial" ou "Instalar app"\n3. Confirme a instalação';
      } else {
        message = 'Para instalar:\n\nNo menu do navegador, procure a opção "Adicionar à tela inicial" ou "Instalar app"';
      }
      
      alert(message);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('app-download-banner-dismissed', 'true');
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-primary via-red-600 to-primary text-white shadow-md border-b-2 border-red-700">
      <div className="container py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Ícone e Mensagem */}
          <div className="flex items-center gap-4 flex-1">
            <div className="bg-white/20 p-3 rounded-full hidden sm:flex">
              <Smartphone className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Download className="h-5 w-5 sm:hidden" />
                Baixe nosso App!
              </h3>
              <p className="text-sm text-white/90 mt-1">
                Acesso rápido, compras facilitadas e ofertas exclusivas
              </p>
            </div>
          </div>

          {/* Botões */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleInstallClick}
              size="lg"
              variant="secondary"
              className="font-bold text-primary hover:text-primary shadow-lg"
            >
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Baixar Agora</span>
              <span className="sm:hidden">Baixar</span>
            </Button>
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
