import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { MapPin, Navigation, Download, Video } from 'lucide-react';

interface HowToGetThereModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Vídeo atualizado para 14MB em alta qualidade - Nov 21, 2025
export default function HowToGetThereModal({ open, onOpenChange }: HowToGetThereModalProps) {
  const address = "Avenida Capão Grosso, 257 - Capão Grosso - São José dos Campos - SP";
  const googleMapsUrl = "https://www.google.com/maps/dir/?api=1&destination=-23.1878191,-45.7646193";
  const videoUrl = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663082745765/ahjQYcJLDCHZQveC.mp4";

  const handleOpenGoogleMaps = () => {
    window.open(googleMapsUrl, '_blank');
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Erro ao carregar vídeo:', e);
    console.error('URL do vídeo:', videoUrl);
  };

  const handleVideoLoaded = () => {
    console.log('Vídeo carregado com sucesso!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <MapPin className="h-6 w-6 text-primary" />
            Como Chegar
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Vídeo Tutorial */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              Vídeo Tutorial do Caminho
            </h3>
            <div className="bg-gradient-to-br from-primary/10 to-red-600/10 border-2 border-primary/20 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-3 rounded-full">
                  <Video className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-lg">Tutorial em Vídeo (1min15s)</p>
                  <p className="text-sm text-muted-foreground">Veja o caminho completo até nossa fábrica</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  📱 Baixe o vídeo em alta qualidade para assistir no seu celular e seguir as direções enquanto dirige
                </p>
                <p className="text-xs text-muted-foreground">
                  Tamanho: 14 MB • Duração: 1min15s • Formato: MP4
                </p>
              </div>
              <a
                href={videoUrl}
                download="como-chegar-bem-casado.mp4"
                className="w-full"
              >
                <Button size="lg" className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg">
                  <Download className="mr-2 h-5 w-5" />
                  Baixar Vídeo Tutorial
                </Button>
              </a>
            </div>
          </div>

          {/* Mapa Google Maps */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              🗺️ Localização no Mapa
            </h3>
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3667.445!2d-45.7646193!3d-23.1878191!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjPCsDExJzE2LjMiUyA0NcKwNDUnNTIuNSJX!5e0!3m2!1spt-BR!2sbr!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização da Fábrica"
              />
            </div>
          </div>

          {/* Botões de Navegação */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Navigation className="h-5 w-5 text-primary" />
              Abrir Navegação
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Google Maps */}
              <button
                onClick={handleOpenGoogleMaps}
                className="flex flex-col items-center gap-3 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-500 rounded-xl p-6 transition-all hover:scale-105 hover:shadow-xl group"
              >
                <img 
                  src="/logos/google-maps.png" 
                  alt="Google Maps" 
                  className="w-32 h-32 object-contain"
                />
                <span className="font-bold text-gray-700 group-hover:text-blue-600 transition-colors">
                  Google Maps
                </span>
              </button>
              
              {/* Waze */}
              <button
                onClick={() => window.open(`https://www.waze.com/ul?ll=-23.1878191,-45.7646193&navigate=yes`, '_blank')}
                className="flex flex-col items-center gap-3 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-cyan-500 rounded-xl p-6 transition-all hover:scale-105 hover:shadow-xl group"
              >
                <img 
                  src="/logos/waze.png" 
                  alt="Waze" 
                  className="w-32 h-32 object-contain"
                />
                <span className="font-bold text-gray-700 group-hover:text-cyan-600 transition-colors">
                  Waze
                </span>
              </button>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Endereço
            </h4>
            <p className="text-sm">{address}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
