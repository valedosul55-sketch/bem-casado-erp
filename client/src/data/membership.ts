export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  period: 'anual';
  discount: number; // Desconto adicional em %
  benefits: string[];
  color: string;
  popular?: boolean;
}

export const membershipPlans: MembershipPlan[] = [
  {
    id: 'basic',
    name: 'Clube Básico',
    price: 89.90,
    period: 'anual',
    discount: 10,
    color: 'blue',
    benefits: [
      '10% de desconto adicional em todos os produtos',
      'Frete grátis em compras acima de R$ 100',
      'Acesso antecipado a promoções',
      'Cupons exclusivos mensais',
      'Atendimento prioritário via WhatsApp',
    ],
  },
  {
    id: 'premium',
    name: 'Clube Premium',
    price: 149.90,
    period: 'anual',
    discount: 15,
    color: 'gold',
    popular: true,
    benefits: [
      '15% de desconto adicional em todos os produtos',
      'Frete grátis em todas as compras',
      'Acesso antecipado a lançamentos',
      'Cupons exclusivos semanais',
      'Atendimento VIP 24/7',
      'Cashback de 2% em todas as compras',
      'Brinde exclusivo no aniversário',
      'Participação em eventos exclusivos',
    ],
  },
];

export interface Member {
  email: string;
  name: string;
  planId: string;
  joinDate: Date;
  expiryDate: Date;
  active: boolean;
}

export function getMembershipStatus(email: string): Member | null {
  const members = JSON.parse(localStorage.getItem('vip_members') || '[]');
  const member = members.find((m: Member) => m.email.toLowerCase() === email.toLowerCase());
  
  if (!member) return null;
  
  // Verificar se ainda está ativo
  const now = new Date();
  const expiry = new Date(member.expiryDate);
  
  if (now > expiry) {
    member.active = false;
  }
  
  return member;
}

export function activateMembership(email: string, name: string, planId: string): Member {
  const members = JSON.parse(localStorage.getItem('vip_members') || '[]');
  
  const now = new Date();
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 ano de validade
  
  const newMember: Member = {
    email: email.toLowerCase(),
    name,
    planId,
    joinDate: now,
    expiryDate,
    active: true,
  };
  
  // Remover membro antigo se existir
  const filteredMembers = members.filter((m: Member) => m.email.toLowerCase() !== email.toLowerCase());
  filteredMembers.push(newMember);
  
  localStorage.setItem('vip_members', JSON.stringify(filteredMembers));
  
  return newMember;
}

export function getMemberDiscount(email: string): number {
  const member = getMembershipStatus(email);
  if (!member || !member.active) return 0;
  
  const plan = membershipPlans.find(p => p.id === member.planId);
  return plan?.discount || 0;
}

export function calculateAnnualSavings(monthlySpending: number, planId: string): number {
  const plan = membershipPlans.find(p => p.id === planId);
  if (!plan) return 0;
  
  const annualSpending = monthlySpending * 12;
  const savings = (annualSpending * plan.discount) / 100;
  const netSavings = savings - plan.price;
  
  return netSavings;
}
