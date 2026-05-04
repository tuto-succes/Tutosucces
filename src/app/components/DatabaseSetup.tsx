import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Database, Users, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-385c5805`;

export function DatabaseSetup() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  async function handleCreateTestUsers() {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/create-test-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create test users');
      }

      setResult(data);
      console.log('✅ Test users created:', data);
    } catch (err: any) {
      setError(err.message);
      console.error('❌ Error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: '#E74C3C' }}
            >
              <Database className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#2C3E50' }}>
                Configuration de la base de données
              </h1>
              <p style={{ color: '#7F8C8D' }}>
                Tuto-Succès B&D - Setup
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#2C3E50' }}>
            <span className="flex items-center justify-center w-8 h-8 rounded-full text-white font-bold" style={{ backgroundColor: '#E74C3C' }}>
              1
            </span>
            Créer la table profiles
          </h2>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="text-sm mb-2" style={{ color: '#7F8C8D' }}>
              Va sur <strong>Supabase → SQL Editor</strong> et exécute ce SQL :
            </p>
            <pre className="text-xs bg-gray-800 text-green-400 p-4 rounded overflow-x-auto">
{`-- Nettoyer
DROP TABLE IF EXISTS profiles CASCADE;
DELETE FROM auth.users;

-- Créer la table profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'tutor', 'student', 'parent')),
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut voir les profiles" 
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Les utilisateurs peuvent modifier leur propre profile" 
  ON profiles FOR UPDATE USING (auth.uid() = id);`}
            </pre>
          </div>
          <div className="p-3 rounded" style={{ backgroundColor: '#E3F2FD' }}>
            <p className="text-sm" style={{ color: '#1976D2' }}>
              ✅ Une fois exécuté, passe à l'étape 2
            </p>
          </div>
        </Card>

        {/* Create Users Button */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#2C3E50' }}>
            <span className="flex items-center justify-center w-8 h-8 rounded-full text-white font-bold" style={{ backgroundColor: '#E74C3C' }}>
              2
            </span>
            Créer les utilisateurs de test
          </h2>
          <p className="mb-4" style={{ color: '#7F8C8D' }}>
            Cette opération va créer 8 utilisateurs de test (1 admin, 3 tuteurs, 2 étudiants, 2 parents)
          </p>
          
          <Button
            onClick={handleCreateTestUsers}
            disabled={loading}
            className="w-full h-12 text-lg font-semibold"
            style={{ backgroundColor: '#E74C3C' }}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                <Users className="w-5 h-5 mr-2" />
                Créer les utilisateurs de test
              </>
            )}
          </Button>

          {/* Results */}
          {result && (
            <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: '#E8F5E9' }}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5" style={{ color: '#4CAF50' }} />
                <p className="font-semibold" style={{ color: '#2E7D32' }}>
                  {result.message}
                </p>
              </div>
              <div className="space-y-1 text-sm">
                {result.results?.map((user: any) => (
                  <div key={user.email} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" style={{ color: '#4CAF50' }} />
                    <span style={{ color: '#2E7D32' }}>
                      {user.email} ({user.role})
                    </span>
                  </div>
                ))}
              </div>
              {result.errors && result.errors.length > 0 && (
                <div className="mt-2 text-sm">
                  <p className="font-semibold" style={{ color: '#D32F2F' }}>Erreurs :</p>
                  {result.errors.map((err: any, i: number) => (
                    <div key={i} style={{ color: '#D32F2F' }}>
                      {err.email}: {err.error}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: '#FFEBEE' }}>
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5" style={{ color: '#D32F2F' }} />
                <p className="font-semibold" style={{ color: '#D32F2F' }}>
                  Erreur : {error}
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Test Credentials */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#2C3E50' }}>
            <span className="flex items-center justify-center w-8 h-8 rounded-full text-white font-bold" style={{ backgroundColor: '#E74C3C' }}>
              3
            </span>
            Identifiants de test
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Admin */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#F8F9FA' }}>
              <p className="font-semibold mb-2" style={{ color: '#2C3E50' }}>👨‍💼 Admin</p>
              <p className="text-sm" style={{ color: '#7F8C8D' }}>admin@tutosucces.com</p>
              <p className="text-sm" style={{ color: '#7F8C8D' }}>Admin123!</p>
            </div>

            {/* Tuteur */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#F8F9FA' }}>
              <p className="font-semibold mb-2" style={{ color: '#2C3E50' }}>👩‍🏫 Tuteur (Marie)</p>
              <p className="text-sm" style={{ color: '#7F8C8D' }}>marie.dubois@tutosucces.com</p>
              <p className="text-sm" style={{ color: '#7F8C8D' }}>Tuteur123!</p>
            </div>

            {/* Étudiant */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#F8F9FA' }}>
              <p className="font-semibold mb-2" style={{ color: '#2C3E50' }}>👨‍🎓 Étudiant (Lucas)</p>
              <p className="text-sm" style={{ color: '#7F8C8D' }}>lucas.tremblay@gmail.com</p>
              <p className="text-sm" style={{ color: '#7F8C8D' }}>Etudiant123!</p>
            </div>

            {/* Parent */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#F8F9FA' }}>
              <p className="font-semibold mb-2" style={{ color: '#2C3E50' }}>👨‍👩‍👧 Parent (Pierre)</p>
              <p className="text-sm" style={{ color: '#7F8C8D' }}>parent.tremblay@gmail.com</p>
              <p className="text-sm" style={{ color: '#7F8C8D' }}>Parent123!</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}