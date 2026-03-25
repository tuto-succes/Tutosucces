import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { healthCheck } from '../utils/supabase-client';
import { projectId } from '../utils/supabase/info';

interface ServerDiagnosticProps {
  onBack: () => void;
}

interface DiagnosticTest {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  details?: string;
}

export function ServerDiagnostic({ onBack }: ServerDiagnosticProps) {
  const [tests, setTests] = useState<DiagnosticTest[]>([
    { name: 'Test de connexion au serveur', status: 'pending' },
    { name: 'Vérification du health check', status: 'pending' },
    { name: 'Test de la route login', status: 'pending' },
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTest = (index: number, updates: Partial<DiagnosticTest>) => {
    setTests(prev => prev.map((test, i) => i === index ? { ...test, ...updates } : test));
  };

  const runDiagnostic = async () => {
    setIsRunning(true);

    // Test 1: Connexion au serveur
    updateTest(0, { status: 'running' });
    try {
      const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-385c5805/health`;
      const response = await fetch(serverUrl);
      
      if (response.ok) {
        updateTest(0, {
          status: 'success',
          message: 'Le serveur est accessible',
          details: `URL: ${serverUrl}`
        });

        // Test 2: Health check
        updateTest(1, { status: 'running' });
        try {
          const health = await healthCheck();
          
          if (health.status === 'ok') {
            updateTest(1, {
              status: 'success',
              message: 'Le health check répond correctement',
              details: JSON.stringify(health, null, 2)
            });

            // Test 3: Test de login avec des données invalides (pour voir si la route existe)
            updateTest(2, { status: 'running' });
            try {
              const loginUrl = `https://${projectId}.supabase.co/functions/v1/make-server-385c5805/login`;
              const loginResponse = await fetch(loginUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'test@test.com', password: 'test' })
              });

              // On attend une erreur 401 (credentials invalides), ce qui signifie que la route existe
              if (loginResponse.status === 401) {
                updateTest(2, {
                  status: 'success',
                  message: 'La route login existe et répond (401 attendu)',
                  details: 'La route fonctionne. Vérifiez vos identifiants.'
                });
              } else if (loginResponse.status === 404) {
                updateTest(2, {
                  status: 'error',
                  message: 'La route login n\'existe pas (404)',
                  details: 'Le serveur est accessible mais la route /login est introuvable.'
                });
              } else {
                const data = await loginResponse.json();
                updateTest(2, {
                  status: 'error',
                  message: `Réponse inattendue: ${loginResponse.status}`,
                  details: JSON.stringify(data, null, 2)
                });
              }
            } catch (error: any) {
              updateTest(2, {
                status: 'error',
                message: 'Erreur lors du test de la route login',
                details: error.message
              });
            }
          } else {
            updateTest(1, {
              status: 'error',
              message: 'Le health check répond mais avec une erreur',
              details: JSON.stringify(health, null, 2)
            });
          }
        } catch (error: any) {
          updateTest(1, {
            status: 'error',
            message: 'Le health check ne répond pas',
            details: error.message
          });
        }
      } else {
        updateTest(0, {
          status: 'error',
          message: `Le serveur répond avec l'erreur ${response.status}`,
          details: await response.text()
        });
      }
    } catch (error: any) {
      updateTest(0, {
        status: 'error',
        message: 'Impossible de contacter le serveur',
        details: error.message
      });
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: DiagnosticTest['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-6 h-6 rounded-full border-2 border-gray-300" />;
      case 'running':
        return <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#2E5CA8' }} />;
      case 'success':
        return <CheckCircle className="w-6 h-6" style={{ color: '#27AE60' }} />;
      case 'error':
        return <XCircle className="w-6 h-6" style={{ color: '#E74C3C' }} />;
    }
  };

  const allSuccess = tests.every(t => t.status === 'success');
  const hasErrors = tests.some(t => t.status === 'error');

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F9FA' }}>
      {/* Header */}
      <div className="bg-white shadow-sm p-6">
        <Button
          variant="ghost"
          onClick={onBack}
          style={{ color: '#7F8C8D' }}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la connexion
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-3xl">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Header */}
            <div className="mb-8 text-center">
              <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#2E5CA8' }} />
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#2C3E50' }}>
                Diagnostic du serveur
              </h1>
              <p style={{ color: '#7F8C8D' }}>
                Ce test vérifie que le serveur backend Supabase est accessible et fonctionne correctement.
              </p>
            </div>

            {/* Tests */}
            <div className="space-y-4 mb-8">
              {tests.map((test, index) => (
                <div
                  key={index}
                  className="border-2 rounded-lg p-4"
                  style={{
                    borderColor: test.status === 'error' ? '#E74C3C' : test.status === 'success' ? '#27AE60' : '#E5E7EB'
                  }}
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(test.status)}
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1" style={{ color: '#2C3E50' }}>
                        {test.name}
                      </h3>
                      {test.message && (
                        <p className="text-sm mb-2" style={{ color: '#7F8C8D' }}>
                          {test.message}
                        </p>
                      )}
                      {test.details && (
                        <pre
                          className="text-xs p-2 rounded overflow-x-auto"
                          style={{ backgroundColor: '#F8F9FA', color: '#2C3E50' }}
                        >
                          {test.details}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Results Summary */}
            {!isRunning && (allSuccess || hasErrors) && (
              <div
                className="border-2 rounded-lg p-6 mb-6"
                style={{
                  borderColor: allSuccess ? '#27AE60' : '#E74C3C',
                  backgroundColor: allSuccess ? '#E8F5E9' : '#FFEBEE'
                }}
              >
                {allSuccess ? (
                  <>
                    <h3 className="font-bold text-lg mb-2" style={{ color: '#27AE60' }}>
                      ✅ Tous les tests sont réussis !
                    </h3>
                    <p style={{ color: '#2C3E50' }}>
                      Le serveur backend fonctionne correctement. Si vous ne pouvez toujours pas vous connecter, vérifiez :
                    </p>
                    <ul className="mt-3 space-y-1 text-sm" style={{ color: '#2C3E50' }}>
                      <li>• Que vos identifiants sont corrects</li>
                      <li>• Que les données de test sont insérées dans la base de données</li>
                      <li>• Que les utilisateurs sont créés dans Supabase Auth</li>
                    </ul>
                  </>
                ) : (
                  <>
                    <h3 className="font-bold text-lg mb-2" style={{ color: '#E74C3C' }}>
                      ❌ Des erreurs ont été détectées
                    </h3>
                    <p style={{ color: '#2C3E50' }} className="mb-3">
                      Le serveur backend n'est pas accessible ou ne fonctionne pas correctement.
                    </p>
                    <div className="space-y-2 text-sm" style={{ color: '#2C3E50' }}>
                      <p><strong>Solutions possibles :</strong></p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Vérifiez que le serveur Edge Function est déployé dans Supabase</li>
                        <li>Vérifiez les logs du serveur dans le Dashboard Supabase</li>
                        <li>Essayez de redéployer le serveur</li>
                        <li>Vérifiez les variables d'environnement (SUPABASE_URL, SUPABASE_ANON_KEY, etc.)</li>
                      </ol>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                onClick={runDiagnostic}
                disabled={isRunning}
                className="flex-1"
                style={{
                  backgroundColor: '#2E5CA8',
                  opacity: isRunning ? 0.7 : 1
                }}
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Test en cours...
                  </>
                ) : (
                  'Lancer le diagnostic'
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={onBack}
                style={{ borderColor: '#E5E7EB', color: '#7F8C8D' }}
              >
                Retour
              </Button>
            </div>

            {/* Help Section */}
            <div className="mt-8 pt-8 border-t-2" style={{ borderColor: '#E5E7EB' }}>
              <h3 className="font-semibold mb-3" style={{ color: '#2C3E50' }}>
                📚 Documentation
              </h3>
              <ul className="text-sm space-y-2" style={{ color: '#7F8C8D' }}>
                <li>• <strong>Guide de setup :</strong> /SETUP_SUPABASE.md</li>
                <li>• <strong>Dépannage connexion :</strong> /DEPANNAGE_CONNEXION.md</li>
                <li>• <strong>Guide rapide :</strong> /GUIDE_RAPIDE_CONNEXION.md</li>
                <li>• <strong>Erreur "Failed to fetch" :</strong> /ERREUR_FAILED_TO_FETCH.md</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}