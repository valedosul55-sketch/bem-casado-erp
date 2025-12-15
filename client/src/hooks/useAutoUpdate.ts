import { useEffect, useState } from 'react';
import { toast } from 'sonner';

/**
 * Hook para detectar automaticamente quando há uma nova versão da aplicação
 * e recarregar a página para garantir que o usuário sempre veja a versão mais recente.
 * 
 * Estratégia:
 * 1. Verifica a cada 5 minutos se há nova versão
 * 2. Compara o hash do index.html atual com o servidor
 * 3. Se houver mudança, notifica e recarrega automaticamente
 */
export function useAutoUpdate() {
  const [isChecking, setIsChecking] = useState(false);
  const [lastHash, setLastHash] = useState<string | null>(null);

  const checkForUpdates = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    
    try {
      // Busca o index.html com timestamp para evitar cache
      const response = await fetch(`/index.html?t=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-cache',
      });
      
      // Usa ETag ou Last-Modified como identificador de versão
      const etag = response.headers.get('etag');
      const lastModified = response.headers.get('last-modified');
      const currentHash = etag || lastModified || '';
      
      if (!lastHash) {
        // Primeira verificação, apenas armazena o hash
        setLastHash(currentHash);
      } else if (currentHash && currentHash !== lastHash) {
        // Nova versão detectada!
        console.log('Nova versão detectada! Atualizando...');
        
        toast.info('Nova versão disponível!', {
          description: 'Atualizando a página em 3 segundos...',
          duration: 3000,
        });
        
        // Aguarda 3 segundos para o usuário ver a notificação
        setTimeout(() => {
          // Limpa todos os caches antes de recarregar
          if ('caches' in window) {
            caches.keys().then((names) => {
              names.forEach((name) => {
                caches.delete(name);
              });
            });
          }
          
          // Recarrega a página forçando bypass de cache
          window.location.reload();
        }, 3000);
      }
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Verifica imediatamente ao montar
    checkForUpdates();
    
    // Verifica a cada 5 minutos
    const interval = setInterval(checkForUpdates, 5 * 60 * 1000);
    
    // Verifica quando a aba volta a ficar visível
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkForUpdates();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [lastHash]);

  return { isChecking };
}
