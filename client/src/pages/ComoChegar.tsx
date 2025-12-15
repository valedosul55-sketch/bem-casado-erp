import { MapPin, Clock, Phone, Mail, Navigation, Store, Copy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ComoChegar() {
  // Endereço da loja (ajuste conforme necessário)
  const endereco = {
    rua: 'Avenida Capão Grosso, 257',
    bairro: 'Capão Grosso',
    cidade: 'São José dos Campos',
    estado: 'SP',
    cep: '12240-000',
    lat: -23.1878191,
    lng: -45.7646193,
  };

  const horarios = [
    { dia: 'Sábado', horario: '7h às 13h' },
    { dia: 'Outros dias', horario: 'Fechado' },
  ];

  const contato = {
    telefone: '(12) 3907-5811',
    telefone2: '(12) 3207-4000',
    email: 'contato@arrozbemcasado.com.br',
  };

  const abrirNoGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${endereco.lat},${endereco.lng}`;
    window.open(url, '_blank');
  };

  const copiarEndereco = () => {
    const enderecoCompleto = `${endereco.rua}, ${endereco.cidade} - ${endereco.estado}, ${endereco.cep}`;
    navigator.clipboard.writeText(enderecoCompleto);
    toast.success('Endereço copiado!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#E63946] to-[#C62F3A] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Como Chegar</h1>
            <p className="text-lg md:text-xl opacity-90">
              Venha conhecer nossa loja de fábrica e aproveite os melhores preços em arroz e feijão!
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Coluna Principal - Mapa */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#E63946]" />
                  Localização
                </CardTitle>
                <CardDescription>
                  Veja no mapa onde estamos localizados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Iframe do Google Maps - Mapa Estático */}
                <div className="rounded-lg overflow-hidden border border-gray-200" style={{ height: '450px' }}>
                  <iframe
                    src={`https://www.google.com/maps?q=${endereco.lat},${endereco.lng}&hl=pt-BR&z=15&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Localização da Loja"
                  />
                </div>
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={abrirNoGoogleMaps}
                    className="flex-1 bg-[#E63946] hover:bg-[#C62F3A]"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Abrir no Google Maps
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={copiarEndereco}
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Endereço
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Endereço Completo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-[#E63946]" />
                  Endereço Completo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-gray-700">
                  <p className="text-lg font-medium">{endereco.rua}</p>
                  <p>{endereco.cidade} - {endereco.estado}</p>
                  <p>CEP: {endereco.cep}</p>
                </div>
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Dica:</strong> Estamos localizados próximo à fábrica de arroz. 
                    Procure pela placa vermelha "Bem Casado" na entrada.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna Lateral - Informações */}
          <div className="space-y-6">
            {/* Horários de Funcionamento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#E63946]" />
                  Horários
                </CardTitle>
                <CardDescription>
                  Quando estamos abertos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {horarios.map((item, index) => (
                    <div 
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                    >
                      <span className="font-medium text-gray-700">{item.dia}</span>
                      <span className="text-gray-600">{item.horario}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">
                    🛒 Aberto aos sábados!
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Aproveite para fazer suas compras no fim de semana
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contato */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-[#E63946]" />
                  Contato
                </CardTitle>
                <CardDescription>
                  Fale conosco
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Telefone</p>
                      <a 
                        href={`tel:${contato.telefone.replace(/\D/g, '')}`}
                        className="text-lg font-medium text-[#E63946] hover:underline"
                      >
                        {contato.telefone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <a 
                        href={`mailto:${contato.email}`}
                        className="text-lg font-medium text-[#E63946] hover:underline break-all"
                      >
                        {contato.email}
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Formas de Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle>Formas de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>✅ Dinheiro</p>
                  <p>✅ Cartão de Crédito</p>
                  <p>✅ Cartão de Débito</p>
                  <p>✅ PIX</p>
                  <p>✅ Vale Alimentação</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
