// Configuration de base de l'API
const API_CONFIG = {
  // URL de base de l'API (utilisée en développement)
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  
  // Vérifie si nous sommes sur un sous-domaine Cloudflare
  isCloudflareTunnel: (url: string): boolean => {
    return url.includes('.trycloudflare.com');
  },
  
  // Récupère l'URL de base du navigateur
  getBaseUrl: (): string => {
    // En développement, utilisez l'URL du .env
    if (import.meta.env.DEV) {
      return import.meta.env.VITE_API_URL || 'http://localhost:8000';
    }
    
    // En production, utilisez l'URL actuelle du navigateur
    const currentUrl = window.location.origin;
    
    // Si c'est un sous-domaine Cloudflare, utilisez-le
    if (currentUrl.includes('.trycloudflare.com')) {
      return currentUrl;
    }
    
    // Sinon, utilisez l'URL de base du .env ou l'URL de production par défaut
    return import.meta.env.VITE_API_URL || 'https://vizion-academy.pages.dev';
  },
  
  // Récupère l'URL complète de l'API
  getApiUrl: (endpoint: string = ''): string => {
    const baseUrl = API_CONFIG.getBaseUrl();
    
    // Si l'URL de base se termine déjà par /api, ne pas en ajouter un autre
    if (baseUrl.endsWith('/api')) {
      return `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    }
    
    // Sinon, ajouter /api avant l'endpoint
    return `${baseUrl}/api${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  }
};

export default API_CONFIG;
