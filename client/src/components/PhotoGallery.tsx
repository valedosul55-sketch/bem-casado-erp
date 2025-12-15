import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Photo {
  src: string;
  title: string;
  description: string;
}

const photos: Photo[] = [
  {
    src: '/factory-exterior.jpg',
    title: 'Fachada da Fábrica',
    description: 'Nossa moderna instalação em São José dos Campos, com estrutura de 31m x 15m',
  },
  {
    src: '/production-line.jpg',
    title: 'Linha de Produção',
    description: 'Equipamentos de última geração para beneficiamento de arroz e feijão',
  },
  {
    src: '/grain-selection.jpg',
    title: 'Seleção de Grãos',
    description: 'Processo rigoroso de inspeção e seleção dos melhores grãos',
  },
  {
    src: '/warehouse-storage.jpg',
    title: 'Armazenamento',
    description: 'Estoque organizado com controle de qualidade e rastreabilidade',
  },
  {
    src: '/team-working.jpg',
    title: 'Nossa Equipe',
    description: 'Profissionais qualificados e comprometidos com a excelência',
  },
];

export default function PhotoGallery() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  const goToPrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % photos.length);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
  };

  return (
    <>
      <Card className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <Camera className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold">Nossa Fábrica</h2>
        </div>
        <p className="text-lg text-muted-foreground mb-8">
          Conheça nossa estrutura moderna e nosso processo de produção que garante a qualidade dos
          nossos produtos. Clique nas fotos para ampliar.
        </p>

        {/* Grid de fotos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo, index) => (
            <div
              key={index}
              onClick={() => openLightbox(index)}
              className="group relative overflow-hidden rounded-lg cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
            >
              <img
                src={photo.src}
                alt={photo.title}
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="font-bold text-lg mb-1">{photo.title}</h3>
                  <p className="text-sm opacity-90">{photo.description}</p>
                </div>
              </div>
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-5 w-5 text-primary" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Botão fechar */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            aria-label="Fechar"
          >
            <X className="h-8 w-8" />
          </button>

          {/* Navegação anterior */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-4 text-white hover:text-gray-300 transition-colors z-10"
            aria-label="Foto anterior"
          >
            <ChevronLeft className="h-12 w-12" />
          </button>

          {/* Navegação próxima */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-4 text-white hover:text-gray-300 transition-colors z-10"
            aria-label="Próxima foto"
          >
            <ChevronRight className="h-12 w-12" />
          </button>

          {/* Imagem e informações */}
          <div
            className="max-w-6xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[selectedIndex].src}
              alt={photos[selectedIndex].title}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
            <div className="mt-6 text-center text-white">
              <h3 className="text-2xl font-bold mb-2">{photos[selectedIndex].title}</h3>
              <p className="text-lg opacity-90">{photos[selectedIndex].description}</p>
              <p className="text-sm opacity-70 mt-4">
                {selectedIndex + 1} / {photos.length}
              </p>
            </div>
          </div>

          {/* Indicadores */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {photos.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === selectedIndex ? 'bg-white w-8' : 'bg-white/50'
                }`}
                aria-label={`Ir para foto ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
