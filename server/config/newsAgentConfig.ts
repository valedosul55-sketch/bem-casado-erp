/**
 * Configuração do Agente de Monitoramento de Notícias Fiscais e Contábeis
 * 
 * Define fontes, palavras-chave e prioridades para monitoramento automático
 * de mudanças legislativas e notícias do agronegócio.
 */

export const NEWS_AGENT_CONFIG = {
  name: 'NewsMonitoringAgent',
  schedule: '0 8 * * 1-5', // Segunda a sexta, 08:00
  
  recipients: {
    to: process.env.DIRECTOR_EMAIL || 'valedosul55@gmail.com',
    cc: [
      // Desabilitado temporariamente para testes
      // process.env.ACCOUNTING_EMAIL || 'contador@arrozbemcasado.com.br',
      // process.env.TAX_EMAIL || 'fiscal@arrozbemcasado.com.br'
    ]
  },
  
  // Fontes oficiais de monitoramento
  sources: {
    dou: {
      enabled: true,
      url: 'https://www.in.gov.br/consulta',
      priority: 'high',
      description: 'Diário Oficial da União'
    },
    rfb: {
      enabled: true,
      url: 'https://www.gov.br/receitafederal/pt-br/assuntos/noticias',
      priority: 'high',
      description: 'Receita Federal do Brasil'
    },
    confaz: {
      enabled: true,
      url: 'https://www.confaz.fazenda.gov.br/',
      priority: 'high',
      description: 'Conselho Nacional de Política Fazendária (ICMS)'
    },
    cfc: {
      enabled: true,
      url: 'https://cfc.org.br/noticias/',
      priority: 'medium',
      description: 'Conselho Federal de Contabilidade'
    },
    mapa: {
      enabled: true,
      url: 'https://www.gov.br/agricultura/pt-br/assuntos/noticias',
      priority: 'medium',
      description: 'Ministério da Agricultura e Pecuária'
    },
    conab: {
      enabled: true,
      url: 'https://www.conab.gov.br/ultimas-noticias',
      priority: 'low',
      description: 'Companhia Nacional de Abastecimento'
    }
  },
  
  // Palavras-chave por prioridade
  keywords: {
    critical: [
      // Impostos principais
      'ICMS',
      'PIS',
      'COFINS',
      'IPI',
      'ISS',
      
      // NF-e (operação crítica)
      'NF-e',
      'NFe',
      'nota fiscal eletrônica',
      'NFC-e',
      'certificado digital',
      
      // Obrigações críticas
      'SPED Fiscal',
      'SPED Contribuições',
      'EFD-ICMS',
      'EFD-Contribuições',
      'DCTF',
      'ECF'
    ],
    
    high: [
      // Legislação
      'lei complementar',
      'medida provisória',
      'decreto',
      'portaria',
      'instrução normativa',
      'resolução',
      
      // Tributação
      'alíquota',
      'base de cálculo',
      'substituição tributária',
      'ICMS-ST',
      'diferencial de alíquota',
      'DIFAL',
      
      // Produtos
      'arroz',
      'feijão',
      'açúcar',
      'produtos agrícolas',
      'commodities',
      
      // NCM/CEST
      'NCM',
      'CEST',
      'classificação fiscal'
    ],
    
    medium: [
      // Contabilidade
      'NBC TG',
      'CPC',
      'norma contábil',
      'demonstração financeira',
      'DRE',
      'balanço patrimonial',
      
      // Incentivos
      'incentivo fiscal',
      'benefício fiscal',
      'isenção',
      'redução de alíquota',
      'crédito presumido',
      
      // Agronegócio
      'Funrural',
      'SENAR',
      'crédito rural',
      'preço mínimo',
      'PGPM',
      
      // Outros impostos
      'IRPJ',
      'CSLL',
      'Simples Nacional',
      'Lucro Real',
      'Lucro Presumido'
    ],
    
    low: [
      // Geral
      'auditoria fiscal',
      'fiscalização',
      'compliance tributário',
      'planejamento tributário',
      
      // Mercado
      'cotação',
      'preço',
      'safra',
      'exportação',
      'importação'
    ]
  },
  
  // Categorias de classificação
  categories: {
    legislation: {
      name: 'Legislação e Normas',
      priority: 'critical',
      icon: '⚖️'
    },
    taxation: {
      name: 'Tributação',
      priority: 'high',
      icon: '💰'
    },
    accounting: {
      name: 'Contabilidade',
      priority: 'medium',
      icon: '📊'
    },
    agribusiness: {
      name: 'Agronegócio',
      priority: 'medium',
      icon: '🌾'
    },
    compliance: {
      name: 'Obrigações Acessórias',
      priority: 'high',
      icon: '📋'
    },
    market: {
      name: 'Mercado e Cotações',
      priority: 'low',
      icon: '📈'
    }
  },
  
  // Configurações de cache e limites
  cache: {
    ttl: 86400, // 24 horas em segundos
    maxItems: 100
  },
  
  limits: {
    maxNewsPerCategory: 5,
    maxTotalNews: 20,
    minRelevanceScore: 0.3
  }
};

export type NewsAgentConfig = typeof NEWS_AGENT_CONFIG;
export type NewsPriority = 'critical' | 'high' | 'medium' | 'low';
export type NewsCategory = keyof typeof NEWS_AGENT_CONFIG.categories;
