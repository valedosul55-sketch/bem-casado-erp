// Configuração de base path para deploy em subpath
// Como estamos usando subdomínio dedicado (loja.arrozbemcasado.com.br), o base path deve ser vazio ou '/'
export const BASE_PATH = '';

// Helper para construir URLs com base path
export const getUrl = (path: string) => {
  // Remove barra inicial se existir
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  // Adiciona base path se não for vazio
  return BASE_PATH ? `${BASE_PATH}/${cleanPath}` : `/${cleanPath}`;
};
