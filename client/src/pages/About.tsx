import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Building2,
  Heart,
  Award,
  Clock,
  Phone,
  Mail,
  MapPin,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Link } from 'wouter';
import PhotoGallery from '@/components/PhotoGallery';
import Footer from '@/components/Footer';

export default function About() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simular envio do formulário
    toast.success('Mensagem enviada!', {
      description: 'Entraremos em contato em breve.',
    });
    
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Sobre a Bem Casado Alimentos</h1>
            <Link href="/">
              <Button variant="secondary">
                Voltar para a Loja
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* História */}
        <section>
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold">Nossa História</h2>
            </div>
            <div className="prose max-w-none">
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                Fundada em 1985, a <strong>Bem Casado Alimentos</strong> nasceu do sonho de uma família
                apaixonada por oferecer produtos de qualidade superior para a mesa dos brasileiros. Começamos
                como uma pequena fábrica de arroz e, ao longo de quase 40 anos, crescemos para
                nos tornar uma referência em arroz e feijão de primeira qualidade.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                Nossa trajetória é marcada pelo compromisso com a excelência, desde a seleção rigorosa dos
                grãos até o processo de beneficiamento e embalagem. Trabalhamos diretamente com produtores
                locais, garantindo não apenas a qualidade dos nossos produtos, mas também o desenvolvimento
                sustentável das comunidades agrícolas.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Hoje, atendemos milhares de famílias em todo o Vale do Paraíba e região, mantendo os mesmos
                valores que nos guiaram desde o início: <strong>qualidade, honestidade e respeito</strong>.
              </p>
            </div>
          </Card>
        </section>

        {/* Missão e Valores */}
        <section>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="h-8 w-8 text-red-500" />
                <h2 className="text-2xl font-bold">Nossa Missão</h2>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Levar alimentos de qualidade superior para a mesa das famílias brasileiras, com preços justos
                e atendimento excepcional, contribuindo para uma alimentação mais saudável e acessível.
              </p>
            </Card>

            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <h2 className="text-2xl font-bold">Nossos Valores</h2>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground"><strong>Qualidade:</strong> Produtos selecionados com rigor</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground"><strong>Transparência:</strong> Honestidade em todas as relações</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground"><strong>Sustentabilidade:</strong> Respeito ao meio ambiente</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground"><strong>Compromisso:</strong> Dedicação aos nossos clientes</span>
                </li>
              </ul>
            </Card>
          </div>
        </section>

        {/* Galeria de Fotos */}
        <section>
          <PhotoGallery />
        </section>

        {/* Certificações */}
        <section>
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Award className="h-8 w-8 text-yellow-500" />
              <h2 className="text-3xl font-bold">Certificações e Qualidade</h2>
            </div>
            <p className="text-lg text-muted-foreground mb-6">
              Nossos produtos atendem aos mais rigorosos padrões de qualidade e segurança alimentar:
            </p>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg text-center">
                <Award className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-2">ANVISA</h3>
                <p className="text-sm text-muted-foreground">Registro e aprovação</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg text-center">
                <Award className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-2">ISO 9001</h3>
                <p className="text-sm text-muted-foreground">Gestão de qualidade</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg text-center">
                <Award className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-2">MAPA</h3>
                <p className="text-sm text-muted-foreground">Ministério da Agricultura</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg text-center">
                <Award className="h-12 w-12 text-orange-600 mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-2">HACCP</h3>
                <p className="text-sm text-muted-foreground">Segurança alimentar</p>
              </div>
            </div>
          </Card>
        </section>

        {/* Informações de Contato e Horário */}
        <section>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="h-8 w-8 text-primary" />
                <h2 className="text-2xl font-bold">Horário de Funcionamento</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-semibold">Sábados e Domingos:</span>
                  <span className="text-muted-foreground">7h às 13h</span>
                </div>
                <div className="flex justify-center items-center py-3 mt-2">
                  <Badge variant="secondary" className="text-sm">Fechado durante a semana</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Phone className="h-8 w-8 text-primary" />
                <h2 className="text-2xl font-bold">Contatos</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">Telefone / WhatsApp</p>
                    <a href="tel:+551231973400" className="text-primary hover:underline">
                      (12) 3197-3400
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">Email</p>
                    <a href="mailto:contato@bemcasado.com.br" className="text-primary hover:underline">
                      contato@bemcasado.com.br
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">Endereço</p>
                    <p className="text-muted-foreground">
                      Avenida Capão Grosso, 257 - Capão Grosso<br />
                      São José dos Campos - SP<br />
                      <span className="text-xs">GPS: 23°11'16.3"S 45°45'52.5"W</span><br />
                      <span className="text-xs">(-23.1878191, -45.7646193)</span>
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Formulário de Contato */}
        <section>
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Send className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold">Entre em Contato</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Nome *</label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Seu nome completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Email *</label>
                  <Input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="seu@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Telefone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(12) 99999-9999"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Mensagem *</label>
                <Textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Como podemos ajudá-lo?"
                  rows={5}
                />
              </div>
              <Button type="submit" size="lg" className="w-full md:w-auto">
                <Send className="mr-2 h-5 w-5" />
                Enviar Mensagem
              </Button>
            </form>
          </Card>
        </section>

        {/* Mapa */}
        <section>
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold">Nossa Localização</h2>
            </div>
            <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3667.445!2d-45.7646193!3d-23.1878191!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjPCsDExJzE2LjMiUyA0NcKwNDUnNTIuNSJX!5e0!3m2!1spt-BR!2sbr!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização Bem Casado Alimentos"
              />
            </div>
            <div className="mt-6 flex flex-col items-center gap-4">
              <p className="text-sm text-muted-foreground text-center">
                Av. Capão Grosso, 257 - Capão Grosso - São José dos Campos - SP
              </p>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=-23.1878191,-45.7646193"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                <MapPin className="h-6 w-6" />
                Como Chegar
              </a>
            </div>
          </Card>
        </section>
      </div>
      
      <Footer />
    </div>
  );
}
