/**
 * Client Supabase - Instance unique pour toute l'application
 */
import { supabase } from '../app/core/supabase.client';

/**
 * Types de la base de données
 */
export interface Profile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'tutor' | 'student' | 'parent';
  phone?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Authentification
 */
export const auth = {
  /**
   * Connexion
   */
  async login(email: string, password: string) {
    console.log('🔐 Tentative de connexion:', email);

    // 1. Authentification Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('❌ Erreur auth:', authError.message);
      throw new Error('Email ou mot de passe incorrect');
    }

    console.log('✅ Auth réussie');

    // 2. Récupérer le profil par ID
    console.log('🔍 Recherche profil pour auth.uid =', authData.user.id);
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();

    console.log('📋 Résultat profil par ID:', profile, 'erreur:', profileError);

    // Fallback: chercher par email si pas trouvé par ID
    let finalProfile = profile;
    if (!finalProfile) {
      console.log('⚠️ Profil pas trouvé par ID, essai par email...');
      const { data: profileByEmail, error: emailError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      console.log('📋 Résultat profil par email:', profileByEmail, 'erreur:', emailError);
      finalProfile = profileByEmail;
    }

    if (!finalProfile) {
      console.error('❌ Aucun profil trouvé pour:', email, 'auth id:', authData.user.id);
      throw new Error(`Profil non trouvé pour ${email}. Vérifiez que votre compte est bien configuré.`);
    }

    console.log('✅ Profil récupéré:', profile.role);

    // 3. Sauvegarder en local
    const userData = {
      id: finalProfile.id,
      email: finalProfile.email,
      name: finalProfile.name,
      role: finalProfile.role,
      phone: finalProfile.phone,
      avatar_url: finalProfile.avatar_url,
      access_token: authData.session?.access_token,
    };

    localStorage.setItem('user', JSON.stringify(userData));

    return userData;
  },

  /**
   * Déconnexion
   */
  async logout() {
    await supabase.auth.signOut();
    localStorage.removeItem('user');
  },

  /**
   * Récupérer l'utilisateur actuel
   */
  getCurrentUser() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },

  /**
   * Vérifier si connecté
   */
  isAuthenticated() {
    return !!this.getCurrentUser();
  },
};

/**
 * API Profiles
 */
export const profiles = {
  /**
   * Récupérer un profil par ID
   */
  async getById(id: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erreur récupération profil:', error);
      return null;
    }

    return data;
  },

  /**
   * Récupérer un profil par email
   */
  async getByEmail(email: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Erreur récupération profil:', error);
      return null;
    }

    return data;
  },

  /**
   * Mettre à jour un profil
   */
  async update(id: string, updates: Partial<Profile>): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erreur mise à jour profil:', error);
      return null;
    }

    // Mettre à jour le localStorage si c'est l'utilisateur actuel
    const currentUser = auth.getCurrentUser();
    if (currentUser && currentUser.id === id) {
      localStorage.setItem('user', JSON.stringify({ ...currentUser, ...updates }));
    }

    return data;
  },

  /**
   * Récupérer tous les profils par rôle
   */
  async getByRole(role: Profile['role']): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', role)
      .order('name');

    if (error) {
      console.error('Erreur récupération profils:', error);
      return [];
    }

    return data || [];
  },
};

/**
 * Health check pour tester la connexion Supabase
 */
export async function healthCheck() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      return { 
        status: 'error', 
        message: 'Erreur de connexion à la base de données',
        error: error.message 
      };
    }

    return { 
      status: 'ok', 
      message: 'Connexion Supabase établie',
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    return { 
      status: 'error', 
      message: 'Erreur de connexion',
      error: error.message 
    };
  }
}
