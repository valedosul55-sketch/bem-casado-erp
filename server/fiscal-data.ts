/**
 * Dados fiscais da empresa para emissão de NFC-e
 * Extraídos da planilha de cadastro fornecida
 */

export const COMPANY_FISCAL_DATA = {
  // Identificação
  nomeFantasia: "BEM CASADO ALIMENTOS",
  apelido: "BEM CASADO",
  razaoSocial: "INDÚSTRIA E COMERCIO DE ALIMENTOS BEM CASADO LTDA",
  cnpj: "14295537000130", // Sem pontuação
  
  // Inscrições
  inscricaoEstadual: "645342314116", // IE sem pontuação
  inscricaoMunicipal: "304129",
  
  // Endereço
  tipoEndereco: "ESTRADA MUNICIPAL",
  logradouro: "SANTO ANTÔNIO DO ALTO",
  numero: "257",
  complemento: "COND: CAPAO GROSSO II;",
  cep: "12225810", // CEP sem pontuação
  bairro: "PARQUE NOVO HORIZONTE",
  codigoMunicipio: "3549904", // Código IBGE São José dos Campos
  municipio: "SÃO JOSE DOS CAMPOS",
  uf: "SP",
  
  // Contato
  telefone: "12981949314",
  email: "CONTROLADORIA@ARROZVALEDOSUL.COM.BR",
  
  // Tributação
  regimeTributario: "3", // 1=Simples Nacional, 2=Simples Nacional - excesso, 3=Regime Normal
  cnae: "4632003", // Comércio atacadista de cereais e leguminosas beneficiados
  
  // NFC-e
  csc: "64ec579e-65eb-48f9-b2ef-42fc57984476", // Código de Segurança do Contribuinte
  idToken: "000001", // ID do Token CSC
  
  // Certificado Digital
  certificadoSenha: "1234",
  
  // Série e Numeração
  serie: "1", // Série da NFC-e
  ambiente: "2", // 1=Produção, 2=Homologação (começar em homologação)
} as const;

/**
 * URLs dos webservices SEFAZ-SP para NFC-e
 */
export const SEFAZ_URLS = {
  // Homologação
  homologacao: {
    autorizacao: "https://homologacao.nfce.fazenda.sp.gov.br/ws/NFeAutorizacao4.asmx",
    retAutorizacao: "https://homologacao.nfce.fazenda.sp.gov.br/ws/NFeRetAutorizacao4.asmx",
    consultaProtocolo: "https://homologacao.nfce.fazenda.sp.gov.br/ws/NFeConsultaProtocolo4.asmx",
    statusServico: "https://homologacao.nfce.fazenda.sp.gov.br/ws/NFeStatusServico4.asmx",
    inutilizacao: "https://homologacao.nfce.fazenda.sp.gov.br/ws/NFeInutilizacao4.asmx",
  },
  // Produção
  producao: {
    autorizacao: "https://nfce.fazenda.sp.gov.br/ws/NFeAutorizacao4.asmx",
    retAutorizacao: "https://nfce.fazenda.sp.gov.br/ws/NFeRetAutorizacao4.asmx",
    consultaProtocolo: "https://nfce.fazenda.sp.gov.br/ws/NFeConsultaProtocolo4.asmx",
    statusServico: "https://nfce.fazenda.sp.gov.br/ws/NFeStatusServico4.asmx",
    inutilizacao: "https://nfce.fazenda.sp.gov.br/ws/NFeInutilizacao4.asmx",
  },
} as const;
