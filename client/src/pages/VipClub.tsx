import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Crown,
  Check,
  TrendingUp,
  Gift,
  Truck,
  Tag,
  Sparkles,
  Calculator,
} from 'lucide-react';
import { membershipPlans, activateMembership, calculateAnnualSavings } from '@/data/membership';
import { toast } from 'sonner';
import Footer from '@/components/Footer';

export default function VipClub() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [monthlySpending, setMonthlySpending] = useState(200);

  const handleJoinClick = (planId: string) => {
    setSelectedPlan(planId);
    setShowJoinForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !selectedPlan) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    const member = activateMembership(formData.email, formData.name, selectedPlan);
    const plan = membershipPlans.find(p => p.id === selectedPlan);

    toast.success(
      <div className="flex flex-col gap-2">
        <p className="font-semibold flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          Bem-vindo ao {plan?.name}!
        </p>
        <p className="text-sm">Sua assinatura está ativa até {new Date(member.expiryDate).toLocaleDateString('pt-BR')}</p>
        <p className="text-xs text-muted-foreground">Aproveite seus benefícios exclusivos!</p>
      </div>,
      { duration: 6000 }
    );

    setShowJoinForm(false);
    setFormData({ name: '', email: '' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <div className="container py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="h-16 w-16 text-yellow-500" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent">
              Clube VIP Bem Casado
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Economize mais comprando com exclusividade. Descontos especiais, frete grátis e benefícios únicos para você!
          </p>
        </div>

        {/* Benefícios Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <Tag className="h-10 w-10 text-primary mx-auto mb-3" />
            <h3 className="font-bold mb-2">Descontos Exclusivos</h3>
            <p className="text-sm text-muted-foreground">Até 15% OFF em todos os produtos</p>
          </Card>
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <Truck className="h-10 w-10 text-primary mx-auto mb-3" />
            <h3 className="font-bold mb-2">Frete Grátis</h3>
            <p className="text-sm text-muted-foreground">Em compras qualificadas</p>
          </Card>
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <Sparkles className="h-10 w-10 text-primary mx-auto mb-3" />
            <h3 className="font-bold mb-2">Acesso Antecipado</h3>
            <p className="text-sm text-muted-foreground">Promoções e lançamentos</p>
          </Card>
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <Gift className="h-10 w-10 text-primary mx-auto mb-3" />
            <h3 className="font-bold mb-2">Brindes Exclusivos</h3>
            <p className="text-sm text-muted-foreground">Presentes especiais</p>
          </Card>
        </div>

        {/* Planos */}
        <h2 className="text-3xl font-bold text-center mb-8">Escolha seu Plano</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {membershipPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`p-8 relative ${
                plan.popular ? 'border-2 border-yellow-500 shadow-2xl' : ''
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-white">
                  MAIS POPULAR
                </Badge>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl font-bold text-primary">
                    R$ {plan.price.toFixed(2)}
                  </span>
                  <span className="text-muted-foreground">/ano</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Apenas R$ {(plan.price / 12).toFixed(2)}/mês
                </p>
              </div>

              <div className="mb-6">
                <div className="bg-primary/10 rounded-lg p-4 text-center mb-4">
                  <p className="text-sm font-semibold text-primary">
                    {plan.discount}% de desconto adicional em todos os produtos
                  </p>
                </div>

                <ul className="space-y-3">
                  {plan.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={() => handleJoinClick(plan.id)}
                className="w-full"
                size="lg"
                variant={plan.popular ? 'default' : 'outline'}
              >
                <Crown className="h-5 w-5 mr-2" />
                Assinar Agora
              </Button>
            </Card>
          ))}
        </div>

        {/* Simulador de Economia */}
        <Card className="p-8 max-w-3xl mx-auto mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Calculator className="h-8 w-8 text-primary" />
            <h2 className="text-2xl font-bold">Calcule sua Economia Anual</h2>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Quanto você gasta por mês em média? R$ {monthlySpending.toFixed(2)}
            </label>
            <input
              type="range"
              min="50"
              max="1000"
              step="50"
              value={monthlySpending}
              onChange={(e) => setMonthlySpending(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {membershipPlans.map((plan) => {
              const savings = calculateAnnualSavings(monthlySpending, plan.id);
              const isWorthIt = savings > 0;

              return (
                <div
                  key={plan.id}
                  className={`p-6 rounded-lg border-2 ${
                    isWorthIt ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <h3 className="font-bold mb-3">{plan.name}</h3>
                  <div className="space-y-2 text-sm">
                    <p>Gasto anual: R$ {(monthlySpending * 12).toFixed(2)}</p>
                    <p>Desconto ({plan.discount}%): R$ {((monthlySpending * 12 * plan.discount) / 100).toFixed(2)}</p>
                    <p>Custo do plano: -R$ {plan.price.toFixed(2)}</p>
                    <div className={`font-bold text-lg pt-2 border-t ${isWorthIt ? 'text-green-600' : 'text-red-600'}`}>
                      <TrendingUp className="inline h-5 w-5 mr-1" />
                      Economia líquida: R$ {savings.toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-sm text-muted-foreground text-center mt-6">
            * Cálculo baseado no desconto adicional aplicado sobre suas compras anuais
          </p>
        </Card>

        {/* Formulário de Adesão */}
        {showJoinForm && (
          <Card className="p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Complete sua Adesão</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome Completo</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Digite seu nome"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seu@email.com"
                  required
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="flex-1">
                  Confirmar Adesão
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowJoinForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
}
