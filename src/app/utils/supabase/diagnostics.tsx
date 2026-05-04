import { supabase } from './client';
import { projectId, publicAnonKey } from './info';

/**
 * Run comprehensive diagnostics on Supabase connection
 * Returns detailed information about connection health
 */
export async function runSupabaseDiagnostics(): Promise<{
  success: boolean;
  issues: string[];
  details: any;
}> {
  const issues: string[] = [];
  const details: any = {};

  console.log('🔍 Démarrage des diagnostics Supabase...');

  // 1. Check configuration
  if (!projectId) {
    issues.push('Project ID manquant');
    console.error('❌ Project ID manquant');
  } else {
    details.projectId = projectId;
    console.log('✓ Project ID:', projectId);
  }

  if (!publicAnonKey) {
    issues.push('Public Anon Key manquante');
    console.error('❌ Public Anon Key manquante');
  } else {
    details.hasAnonKey = true;
    console.log('✓ Public Anon Key présente');
  }

  // 2. Check localStorage
  try {
    const testKey = '__supabase_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    details.localStorage = 'accessible';
    console.log('✓ LocalStorage accessible');
  } catch (error) {
    issues.push('LocalStorage non accessible');
    details.localStorage = 'inaccessible';
    console.error('❌ LocalStorage non accessible:', error);
  }

  // 3. Test network connectivity to Supabase
  try {
    const response = await fetch(`https://${projectId}.supabase.co/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': publicAnonKey,
      },
    });
    details.networkStatus = response.status;
    if (response.ok || response.status === 404) {
      console.log('✓ Connectivité réseau OK');
    } else {
      issues.push(`Problème réseau: Status ${response.status}`);
      console.error('❌ Problème réseau:', response.status, response.statusText);
    }
  } catch (error: any) {
    issues.push('Impossible de se connecter au serveur Supabase');
    details.networkError = error.message;
    console.error('❌ Erreur réseau:', error);
  }

  // 4. Test auth service - DÉSACTIVÉ EN MODE MOCK
  try {
    details.authStatus = 'mock-mode';
    details.hasSession = false;
    console.log('✓ Mode démonstration - Auth désactivé');
  } catch (error: any) {
    console.error('❌ Exception:', error);
  }

  // 5. Check for old/invalid tokens in localStorage
  try {
    const keys = Object.keys(localStorage);
    const supabaseKeys = keys.filter(k => 
      k.includes('supabase') || k.includes('sb-')
    );
    details.storageKeys = supabaseKeys;
    console.log('ℹ️ Clés Supabase dans localStorage:', supabaseKeys);
  } catch (error) {
    console.error('❌ Impossible de lire localStorage');
  }

  // 6. Summary
  const success = issues.length === 0;
  console.log('📊 Résumé des diagnostics:');
  console.log('- Statut:', success ? '✅ OK' : '❌ Problèmes détectés');
  console.log('- Problèmes:', issues.length);
  if (issues.length > 0) {
    issues.forEach(issue => console.log('  •', issue));
  }

  return {
    success,
    issues,
    details,
  };
}

/**
 * Clear all Supabase-related data from localStorage
 */
export async function clearSupabaseStorage(): Promise<void> {
  console.log('🧹 Nettoyage du stockage Supabase...');
  
  try {
    // Get all Supabase-related keys
    const keys = Object.keys(localStorage);
    const supabaseKeys = keys.filter(k => 
      k.includes('supabase') || k.includes('sb-')
    );
    
    console.log('Clés à supprimer:', supabaseKeys);
    
    // Remove each key
    supabaseKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log('✓ Supprimé:', key);
    });
    
    // Mode mock - pas de signOut
    console.log('✓ Mode démonstration - signOut désactivé');
    
    console.log('✅ Nettoyage terminé');
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    throw error;
  }
}