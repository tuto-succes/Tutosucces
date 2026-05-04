import { useState } from 'react';
import { UserPlus, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

const API_URL = 'https://fygrusrtiwiyiqvpznty.supabase.co/functions/v1/make-server-385c5805';

const users = [
  { email: 'tuteur1@test.com', password: 'Tuteur123!', name: 'Marie Leclerc', role: 'tutor' },
  { email: 'tuteur2@test.com', password: 'Tuteur123!', name: 'Jean Tremblay', role: 'tutor' },
  { email: 'eleve1@test.com', password: 'Eleve123!', name: 'Sophie Martin', role: 'student' },
  { email: 'eleve2@test.com', password: 'Eleve123!', name: 'Lucas Dubois', role: 'student' }
];

export function CreateTestAccounts() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  async function createAccounts() {
    setLoading(true);
    setResults([]);
    
    const newResults = [];
    
    for (const user of users) {
      try {
        const response = await fetch(`${API_URL}/create-user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        });
        
        const data = await response.json();
        
        if (response.ok) {
          newResults.push({ success: true, user });
          console.log(`✅ Créé: ${user.name} (${user.email})`);
        } else {
          newResults.push({ success: false, user, error: data.error });
          console.error(`❌ Erreur pour ${user.email}:`, data.error);
        }
      } catch (error: any) {
        newResults.push({ success: false, user, error: error.message });
        console.error(`❌ Erreur réseau pour ${user.email}:`, error);
      }
      
      setResults([...newResults]);
    }
    
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: '#2C3E50' }}>
          Créer les comptes de test
        </h3>
        <p className="text-sm" style={{ color: '#7F8C8D' }}>
          Crée automatiquement 2 tuteurs et 2 élèves pour tester la plateforme
        </p>
      </div>

      <Button 
        onClick={createAccounts}
        disabled={loading}
        className="w-full"
        style={{ backgroundColor: '#2E5CA8' }}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Création en cours...
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4 mr-2" />
            Créer les 4 comptes de test
          </>
        )}
      </Button>

      {results.length > 0 && (
        <div className="space-y-2 mt-4">
          {results.map((result, index) => (
            <div 
              key={index}
              className={`p-3 rounded text-sm ${
                result.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              {result.success ? (
                <div style={{ color: '#27ae60' }}>
                  ✅ {result.user.name} ({result.user.email})
                </div>
              ) : (
                <div style={{ color: '#E74C3C' }}>
                  ❌ {result.user.name}: {result.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {results.length === 4 && results.every(r => r.success) && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <h4 className="font-semibold mb-2" style={{ color: '#2C3E50' }}>
            📋 Récapitulatif des comptes
          </h4>
          <div className="space-y-2 text-sm" style={{ color: '#2C3E50' }}>
            <div>
              <strong>👨‍🏫 Tuteurs:</strong>
              <ul className="ml-4 mt-1">
                <li>• Marie Leclerc - tuteur1@test.com / Tuteur123!</li>
                <li>• Jean Tremblay - tuteur2@test.com / Tuteur123!</li>
              </ul>
            </div>
            <div className="mt-2">
              <strong>👨‍🎓 Élèves:</strong>
              <ul className="ml-4 mt-1">
                <li>• Sophie Martin - eleve1@test.com / Eleve123!</li>
                <li>• Lucas Dubois - eleve2@test.com / Eleve123!</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
