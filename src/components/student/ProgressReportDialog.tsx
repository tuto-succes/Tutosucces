import { useState, useEffect } from 'react';
import { FileText, Download, X, TrendingUp, ThumbsUp, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';

interface ProgressReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: any[];
  userId: string;
}

export function ProgressReportDialog({ isOpen, onClose, sessions, userId }: ProgressReportDialogProps) {
  const [availableReports, setAvailableReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  useEffect(() => {
    // Grouper les séances par tuteur
    const sessionsByTutor: Record<string, any[]> = {};
    
    sessions.forEach((session) => {
      const tutorId = session.tutorId;
      if (!sessionsByTutor[tutorId]) {
        sessionsByTutor[tutorId] = [];
      }
      sessionsByTutor[tutorId].push(session);
    });

    // Créer des rapports pour les tuteurs avec 3+ séances
    const reports: any[] = [];
    Object.entries(sessionsByTutor).forEach(([tutorId, tutorSessions]) => {
      if (tutorSessions.length >= 3) {
        // Trier par date
        const sortedSessions = [...tutorSessions].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // Prendre les sessions par groupes de 3
        for (let i = 2; i < sortedSessions.length; i++) {
          const sessionGroup = sortedSessions.slice(Math.max(0, i - 2), i + 1);
          
          reports.push({
            id: `report-${tutorId}-${i}`,
            tutorId,
            tutorName: sortedSessions[0].tutor?.name || 'Tuteur',
            studentName: sortedSessions[0].student?.name || 'Élève',
            studentLevel: sortedSessions[0].student?.level || 'Secondaire',
            studentSchool: sortedSessions[0].student?.school || 'École',
            parentName: sortedSessions[0].student?.parentName || 'Parent',
            parentEmail: sortedSessions[0].student?.parentEmail || 'parent@email.com',
            sessionCount: i + 1,
            firstSessionDate: sortedSessions[0].date,
            lastSessionDate: sortedSessions[i].date,
            subjects: [...new Set(sessionGroup.map(s => s.subject))],
            reportDate: new Date().toISOString(),
            
            // Template data - À éditer par le tuteur
            objectives: [
              "Améliorer la compréhension des concepts fondamentaux",
              "Développer l'autonomie dans la résolution de problèmes",
              "Renforcer la confiance en ses capacités"
            ],
            progressDescription: "L'élève montre une amélioration constante dans sa compréhension des notions abordées. Les efforts fournis sont remarquables et se reflètent dans la qualité du travail produit.",
            strengths: "Bonne capacité d'analyse, persévérance face aux difficultés, excellente participation durant les séances.",
            participation: "L'élève est engagé et pose des questions pertinentes. La motivation est constante et l'attitude face à l'apprentissage est très positive.",
            
            // Échelles 1-5
            comprehension: 4,
            autonomy: 3,
            organization: 4,
            motivation: 5,
            
            areasToImprove: "Continuer à développer les méthodes de travail personnel et la gestion du temps lors des examens.",
            concentration: "Bonne capacité de concentration. Quelques distractions mineures mais rien qui n'entrave l'apprentissage.",
            
            strategies: [
              "Poursuivre la pratique régulière des exercices",
              "Utiliser des schémas et des visuels pour mieux retenir les concepts",
              "Établir un calendrier d'étude structuré"
            ],
            
            parentRecommendations: "Encourager la pratique quotidienne (15-20 minutes) et vérifier régulièrement les devoirs. Maintenir un environnement d'étude calme et bien organisé.",
            studyPlan: "Révisions courtes mais fréquentes, utilisation de fiches de révision, et pratique d'exercices variés.",
            
            overallAssessment: "En bonne progression", // "En bonne progression" / "Progression stable" / "À surveiller"
            finalAppreciation: "L'élève progresse de manière satisfaisante et démontre un réel engagement dans son apprentissage. Avec la continuité de cet effort, les résultats ne peuvent que s'améliorer."
          });
        }
      }
    });

    setAvailableReports(reports);
    if (reports.length > 0) {
      setSelectedReport(reports[reports.length - 1]); // Le rapport le plus récent
    }
  }, [sessions]);

  const handlePrint = () => {
    window.print();
  };

  if (availableReports.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rapports de progression</DialogTitle>
          </DialogHeader>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Aucun rapport disponible</strong><br />
              Les rapports de progression sont générés automatiquement à partir de la 3ème séance complétée avec un même tuteur.
              Complétez plus de séances pour accéder aux rapports.
            </AlertDescription>
          </Alert>
          <div className="flex justify-end">
            <Button onClick={onClose}>Fermer</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Rapport de progression</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {selectedReport && (
          <div className="space-y-6 p-6 bg-white" id="progress-report-content">
            {/* En-tête */}
            <div className="text-center border-b pb-4">
              <h1 className="text-3xl font-bold" style={{ color: '#E74C3C' }}>
                Tuto-Succès B&D
              </h1>
              <p className="text-sm text-gray-600 mt-1">Rapport de progression de l'élève</p>
            </div>

            {/* Informations générales */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Nom de l'élève :</strong> {selectedReport.studentName}
              </div>
              <div>
                <strong>Niveau scolaire :</strong> {selectedReport.studentLevel}
              </div>
              <div>
                <strong>École :</strong> {selectedReport.studentSchool}
              </div>
              <div>
                <strong>Nom du tuteur :</strong> {selectedReport.tutorName}
              </div>
              <div>
                <strong>Nom du parent / responsable :</strong> {selectedReport.parentName}
              </div>
              <div>
                <strong>Courriel du parent :</strong> {selectedReport.parentEmail}
              </div>
              <div>
                <strong>Matières travaillées :</strong> {selectedReport.subjects.join(', ')}
              </div>
              <div>
                <strong>Date du rapport :</strong> {new Date(selectedReport.reportDate).toLocaleDateString('fr-FR')}
              </div>
              <div>
                <strong>Nombre de séances cumulées :</strong> {selectedReport.sessionCount}
              </div>
              <div>
                <strong>Période :</strong> {new Date(selectedReport.firstSessionDate).toLocaleDateString('fr-FR')} au {new Date(selectedReport.lastSessionDate).toLocaleDateString('fr-FR')}
              </div>
            </div>

            <Separator />

            {/* Section 1 - Objectifs */}
            <div>
              <h3 className="font-semibold text-lg mb-2" style={{ color: '#2E5CA8' }}>
                1. Objectifs des séances précédentes
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {selectedReport.objectives.map((obj: string, idx: number) => (
                  <li key={idx}>{obj}</li>
                ))}
              </ul>
            </div>

            {/* Section 2 - Progrès réalisés */}
            <div>
              <h3 className="font-semibold text-lg mb-3" style={{ color: '#2E5CA8' }}>
                2. Progrès réalisés
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Description globale des progrès</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {selectedReport.progressDescription}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Points forts observés</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {selectedReport.strengths}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Participation / Motivation</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {selectedReport.participation}
                  </p>
                </div>

                {/* Échelles */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Compréhension des notions</span>
                      <span className="font-semibold">{selectedReport.comprehension}/5</span>
                    </div>
                    <Progress value={(selectedReport.comprehension / 5) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Autonomie / méthodes de travail</span>
                      <span className="font-semibold">{selectedReport.autonomy}/5</span>
                    </div>
                    <Progress value={(selectedReport.autonomy / 5) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Organisation / gestion du temps</span>
                      <span className="font-semibold">{selectedReport.organization}/5</span>
                    </div>
                    <Progress value={(selectedReport.organization / 5) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Motivation / implication</span>
                      <span className="font-semibold">{selectedReport.motivation}/5</span>
                    </div>
                    <Progress value={(selectedReport.motivation / 5) * 100} className="h-2" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3 - Points à améliorer */}
            <div>
              <h3 className="font-semibold text-lg mb-2" style={{ color: '#2E5CA8' }}>
                3. Points à améliorer
              </h3>
              <div className="space-y-2">
                <div>
                  <h4 className="font-medium text-sm mb-1">Compétences / notions à approfondir</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {selectedReport.areasToImprove}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Organisation, concentration, confiance</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {selectedReport.concentration}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 4 - Stratégies */}
            <div>
              <h3 className="font-semibold text-lg mb-2" style={{ color: '#2E5CA8' }}>
                4. Stratégies pour les prochaines séances
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {selectedReport.strategies.map((strategy: string, idx: number) => (
                  <li key={idx}>{strategy}</li>
                ))}
              </ul>
            </div>

            {/* Section 5 - Recommandations pour les parents */}
            <div>
              <h3 className="font-semibold text-lg mb-2" style={{ color: '#2E5CA8' }}>
                5. Recommandations pour les parents
              </h3>
              <div className="space-y-2">
                <div>
                  <h4 className="font-medium text-sm mb-1">Comment aider l'élève à la maison</h4>
                  <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded border border-yellow-200">
                    {selectedReport.parentRecommendations}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Plan de travail suggéré entre les séances</h4>
                  <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded border border-yellow-200">
                    {selectedReport.studyPlan}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 6 - Appréciation générale */}
            <div>
              <h3 className="font-semibold text-lg mb-2" style={{ color: '#2E5CA8' }}>
                6. Appréciation générale
              </h3>
              <div className="space-y-2">
                <div>
                  <Badge 
                    variant={
                      selectedReport.overallAssessment === "En bonne progression" ? "default" : 
                      selectedReport.overallAssessment === "Progression stable" ? "secondary" : 
                      "destructive"
                    }
                    className="mb-2"
                  >
                    {selectedReport.overallAssessment}
                  </Badge>
                </div>
                <p className="text-sm text-gray-700 bg-blue-50 p-4 rounded border border-blue-200">
                  {selectedReport.finalAppreciation}
                </p>
              </div>
            </div>

            {/* Signature */}
            <div className="border-t pt-4 mt-6">
              <div className="flex justify-between items-end text-sm">
                <div>
                  <p className="font-medium">Signature du tuteur/tutrice</p>
                  <p className="text-gray-600 mt-2">{selectedReport.tutorName}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-600">Date : {new Date(selectedReport.reportDate).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            </div>

            {/* Message de remerciement */}
            <div className="text-center border-t pt-4 mt-6">
              <p className="font-semibold" style={{ color: '#2C3E50' }}>
                Merci de votre confiance envers Tuto-Succès B&D.
              </p>
              <p className="text-sm text-gray-600 italic mt-1">
                L'effort, la persévérance et l'encadrement mènent à la réussite.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-between border-t pt-4">
          <div className="text-sm text-gray-600">
            {availableReports.length} rapport(s) disponible(s)
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
            <Button onClick={handlePrint} style={{ backgroundColor: '#2E5CA8' }}>
              <Download className="h-4 w-4 mr-2" />
              Télécharger / Imprimer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}