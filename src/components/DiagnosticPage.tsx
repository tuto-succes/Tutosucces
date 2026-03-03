import { useState } from 'react';
import { ArrowLeft, Check, X, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { supabase } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface DiagnosticPageProps {
  onBack: () => void;
}

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning' | 'pending' | 'info';
  message: string;
  details?: string;
}

export function DiagnosticPage({ onBack }: DiagnosticPageProps) {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testError, setTestError] = useState('');

  async function runDiagnostics() {
    setResults([]);
    setIsRunning(true);

    const newResults: DiagnosticResult[] = [];

    // Mode démonstration - pas besoin de diagnostics
    newResults.push({
      test: 'Mode démonstration',
      status: 'success',
      message: 'L\'application fonctionne en mode démonstration avec données mock'
    });

    newResults.push({
      test: 'Authentification',
      status: 'info',
      message: 'Utilisez les comptes de démonstration pour vous connecter'
    });

    setResults(newResults);
    setIsRunning(false);
  }

  async function cleanStorage() {
    try {
      console.log('🧹 Nettoyage du stockage local...');
      
      // Effacer uniquement les données d'auth
      localStorage.removeItem('mockAuth');
      
      console.log('✓ Stockage nettoyé');

      alert('✅ Stockage nettoyé avec succès. La page va se recharger.');
      window.location.reload();
    } catch (error: any) {
      console.error('Erreur lors du nettoyage:', error);
      alert('❌ Erreur lors du nettoyage: ' + error.message);
    }
  }

  async function testLogin() {
    setTestResult(null);
    setTestError('');

    const newResults: string[] = [];
    
    newResults.push('🎭 Mode démonstration actif');
    newResults.push('✅ Utilisez les comptes de démonstration:');
    newResults.push('   - Élève: eleve@demo.com / demo123');
    newResults.push('   - Tuteur: tuteur@demo.com / demo123');
    newResults.push('   - Admin: admin@demo.com / admin123');
    
    setTestResult(newResults.join('\n'));
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'error':
        return <X className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'pending':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'info':
        return <RefreshCw className="w-5 h-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-orange-50 border-orange-200';
      case 'pending':
        return 'bg-blue-50 border-blue-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F9FA' }}>
      {/* Header */}
      <div className="p-6 bg-white border-b">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold" style={{ color: '#2C3E50' }}>
          Diagnostic de l'authentification
        </h1>
        <p className="mt-2" style={{ color: '#7F8C8D' }}>
          Testez et diagnostiquez les problèmes d'authentification
        </p>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Bouton de diagnostic automatique */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#2C3E50' }}>
            Diagnostic automatique
          </h2>
          <p className="mb-4" style={{ color: '#7F8C8D' }}>
            Exécutez une série de tests pour vérifier la configuration et l'état de l'authentification.
          </p>
          <Button
            onClick={runDiagnostics}
            disabled={isRunning}
            style={{ backgroundColor: '#2E5CA8' }}
            className="text-white"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Diagnostic en cours...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Lancer le diagnostic
              </>
            )}
          </Button>
        </Card>

        {/* Test de connexion manuel */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#2C3E50' }}>
            Test de connexion manuel
          </h2>
          <p className="mb-4" style={{ color: '#7F8C8D' }}>
            Testez la connexion avec des identifiants spécifiques.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                Email
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="email@exemple.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                Mot de passe
              </label>
              <input
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="••••••••"
              />
            </div>
            <Button
              onClick={testLogin}
              disabled={isRunning}
              style={{ backgroundColor: '#E74C3C' }}
              className="text-white"
            >
              Tester la connexion
            </Button>
          </div>
        </Card>

        {/* Résultats */}
        {results.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#2C3E50' }}>
              Résultats des tests
            </h2>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getStatusBg(result.status)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getStatusIcon(result.status)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold" style={{ color: '#2C3E50' }}>
                        {result.test}
                      </h3>
                      <p className="text-sm mt-1" style={{ color: '#7F8C8D' }}>
                        {result.message}
                      </p>
                      {result.details && (
                        <p className="text-xs mt-2 font-mono bg-white/50 p-2 rounded">
                          {result.details}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Instructions */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold mb-2" style={{ color: '#2E5CA8' }}>
            💡 Instructions
          </h3>
          <ul className="text-sm space-y-2" style={{ color: '#2C3E50' }}>
            <li>1. Lancez d'abord le diagnostic automatique pour vérifier la configuration</li>
            <li>2. Si tous les tests passent mais vous ne pouvez pas vous connecter, testez avec vos identifiants</li>
            <li>3. Vérifiez la console du navigateur (F12) pour voir les logs détaillés</li>
            <li>4. Si un test échoue, notez le message d'erreur et contactez le support</li>
          </ul>
        </Card>

        {/* Nettoyage du stockage */}
        <Card className="p-6 bg-red-50 border-red-200">
          <h3 className="font-semibold mb-3" style={{ color: '#E74C3C' }}>
            🧹 Nettoyage du stockage
          </h3>
          <p className="text-sm mb-4" style={{ color: '#2C3E50' }}>
            Effacez toutes les données de session stockées pour résoudre les problèmes d'authentification.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={cleanStorage}
              style={{ backgroundColor: '#E74C3C' }}
              className="text-white"
            >
              Nettoyer le stockage
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              style={{ borderColor: '#2E5CA8', color: '#2E5CA8' }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Recharger la page
            </Button>
          </div>
        </Card>

        {/* Informations de debug */}
        <Card className="p-6 bg-gray-50 border-gray-200">
          <h3 className="font-semibold mb-3" style={{ color: '#2C3E50' }}>
            🔍 Informations de debug
          </h3>
          <div className="space-y-2 text-sm font-mono">
            <div className="flex justify-between">
              <span style={{ color: '#7F8C8D' }}>Project ID:</span>
              <span style={{ color: '#2C3E50' }}>{projectId}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#7F8C8D' }}>Storage Key:</span>
              <span style={{ color: '#2C3E50' }}>sb-{projectId}-auth-token</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#7F8C8D' }}>Anon Key (20 chars):</span>
              <span style={{ color: '#2C3E50' }}>{publicAnonKey?.substring(0, 20)}...</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}