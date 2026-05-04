import { supabase } from './supabase/client';

// Mode mock - retourner simplement le token du localStorage
async function getValidToken(): Promise<string | null> {
  try {
    const mockAuthStr = localStorage.getItem('mockAuth');
    if (mockAuthStr) {
      const { token } = JSON.parse(mockAuthStr);
      return token;
    }
    return null;
  } catch (error) {
    console.error('[Auth] Error getting mock token:', error);
    return null;
  }
}

/**
 * Effectue une requête fetch avec authentification automatique
 * Rafraîchit le token si nécessaire avant d'envoyer la requête
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  console.log(`[Auth] Requête authentifiée vers: ${url}`);
  const token = await getValidToken();
  
  if (!token) {
    console.error('[Auth] ✗ Pas de token disponible - Session expirée');
    throw new Error('Session expirée. Veuillez vous reconnecter.');
  }

  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  
  console.log('[Auth] ✓ Envoi de la requête avec token valide');

  const response = await fetch(url, {
    ...options,
    headers
  });
  
  console.log(`[Auth] Réponse reçue: ${response.status} ${response.statusText}`);
  
  return response;
}

/**
 * Wrapper pour les requêtes GET authentifiées
 */
export async function authenticatedGet(url: string): Promise<Response> {
  return authenticatedFetch(url, { method: 'GET' });
}

/**
 * Wrapper pour les requêtes POST authentifiées
 */
export async function authenticatedPost(url: string, body: any): Promise<Response> {
  return authenticatedFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
}

/**
 * Wrapper pour les requêtes PUT authentifiées
 */
export async function authenticatedPut(url: string, body: any): Promise<Response> {
  return authenticatedFetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
}

/**
 * Wrapper pour les requêtes DELETE authentifiées
 */
export async function authenticatedDelete(url: string): Promise<Response> {
  return authenticatedFetch(url, { method: 'DELETE' });
}