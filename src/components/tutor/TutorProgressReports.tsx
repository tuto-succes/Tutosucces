import { useState, useEffect } from 'react';
import { FileText, Download, Eye, Plus, Calendar, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import jsPDF from 'jspdf';

interface ProgressReport {
  id: string;
  studentId: string;
  studentName: string;
  tutorName: string;
  schoolLevel: string;
  school: string;
  parentName: string;
  parentEmail: string;
  subject: string;
  reportDate: string;
  sessionsCount: number;
  firstSessionDate: string;
  lastSessionDate: string;
  
  // Objectifs
  objective1: string;
  objective2?: string;
  objective3?: string;
  
  // Progrès
  progressDescription: string;
  strengths: string;
  participationComment: string;
  
  // Échelles (1-5)
  comprehensionLevel: number;
  autonomyLevel: number;
  organizationLevel: number;
  motivationLevel: number;
  
  // Points à améliorer
  areasToImprove: string;
  organizationImprovements: string;
  
  // Stratégies
  strategy1: string;
  strategy2: string;
  strategy3?: string;
  
  // Recommandations
  parentHelp: string;
  workPlan: string;
  
  // Appréciation
  generalAppreciation: 'En bonne progression' | 'Progression stable' | 'À surveiller';
  finalComment: string;
  
  tutorSignature: string;
  signatureDate: string;
}

export function TutorProgressReports({ tutorId, tutorName }: { tutorId: string; tutorName: string }) {
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgressReports();
  }, [tutorId]);

  const loadProgressReports = () => {
    // Charger les rapports depuis localStorage
    const storedReports = localStorage.getItem('progressReports');
    if (storedReports) {
      const allReports = JSON.parse(storedReports);
      // Filtrer pour le tuteur actuel
      const tutorReports = allReports.filter((r: ProgressReport) => r.tutorName === tutorName);
      setReports(tutorReports);
    } else {
      // Simuler des rapports de progression (mock data) si aucun dans localStorage
      const mockReports: ProgressReport[] = [
        {
          id: 'report-1',
          studentId: 'student-1',
          studentName: 'Sophie Martin',
          tutorName: tutorName,
          schoolLevel: '4e secondaire',
          school: 'École secondaire Jean-de-Brébeuf',
          parentName: 'Marie Martin',
          parentEmail: 'marie.martin@email.com',
          subject: 'Mathématiques',
          reportDate: '2026-03-01',
          sessionsCount: 6,
          firstSessionDate: '2026-01-15',
          lastSessionDate: '2026-02-28',
          
          objective1: 'Renforcer la compréhension des fonctions quadratiques et leurs applications',
          objective2: 'Améliorer les méthodes de résolution d\'équations du second degré',
          objective3: 'Développer l\'autonomie dans la résolution de problèmes complexes',
          
          progressDescription: 'Sophie a fait des progrès remarquables depuis le début du cycle. Elle maîtrise maintenant les concepts de base des fonctions quadratiques et arrive à identifier rapidement la forme canonique. Sa capacité à résoudre des équations s\'est nettement améliorée.',
          strengths: 'Excellente capacité d\'analyse, bonne mémoire visuelle, persévérante face aux défis',
          participationComment: 'Sophie participe activement aux séances, pose des questions pertinentes et fait preuve d\'une grande motivation à progresser.',
          
          comprehensionLevel: 4,
          autonomyLevel: 3,
          organizationLevel: 4,
          motivationLevel: 5,
          
          areasToImprove: 'Les problèmes d\'optimisation nécessitent encore de la pratique. Sophie doit aussi travailler sur les applications concrètes des fonctions dans des contextes réels.',
          organizationImprovements: 'Améliorer la gestion du temps lors des examens en pratiquant avec un chronomètre.',
          
          strategy1: 'Travailler sur 3-4 problèmes d\'optimisation par séance avec complexité croissante',
          strategy2: 'Utiliser des exemples concrets et visuels pour ancrer les concepts abstraits',
          strategy3: 'Mettre en place des mini-évaluations chronométrées pour gérer le stress',
          
          parentHelp: 'Encourager Sophie à expliquer les concepts appris à voix haute (méthode Feynman). Créer un espace calme pour ses révisions quotidiennes de 30 minutes.',
          workPlan: 'Réviser les exercices faits en séance, compléter 5 problèmes par semaine du manuel, et refaire les exercices qui ont posé problème.',
          
          generalAppreciation: 'En bonne progression',
          finalComment: 'Sophie montre une excellente progression et une attitude très positive face aux mathématiques. Avec la continuité de son travail assidu, elle sera bien préparée pour ses examens de fin d\'année.',
          
          tutorSignature: tutorName,
          signatureDate: '2026-03-01',
        },
        {
          id: 'report-2',
          studentId: 'student-2',
          studentName: 'Lucas Tremblay',
          tutorName: tutorName,
          schoolLevel: '2e secondaire',
          school: 'Collège Stanislas',
          parentName: 'Jean Tremblay',
          parentEmail: 'jean.tremblay@email.com',
          subject: 'Français',
          reportDate: '2026-02-15',
          sessionsCount: 4,
          firstSessionDate: '2026-01-20',
          lastSessionDate: '2026-02-14',
          
          objective1: 'Améliorer la structure et la cohérence des textes argumentatifs',
          objective2: 'Enrichir le vocabulaire et réduire les répétitions',
          
          progressDescription: 'Lucas a progressé dans l\'organisation de ses idées. Il commence à utiliser des connecteurs logiques de façon plus naturelle et ses textes gagnent en clarté.',
          strengths: 'Créativité, originalité des idées, bonne compréhension de lecture',
          participationComment: 'Lucas est impliqué et apprécie les séances. Il est parfois distrait mais revient rapidement sur le sujet.',
          
          comprehensionLevel: 4,
          autonomyLevel: 3,
          organizationLevel: 3,
          motivationLevel: 4,
          
          areasToImprove: 'La révision orthographique doit devenir un réflexe. Lucas doit aussi travailler sur la planification avant l\'écriture pour éviter les hors-sujet.',
          organizationImprovements: 'Utiliser un plan détaillé avant chaque rédaction et se relire systématiquement.',
          
          strategy1: 'Créer des banques de vocabulaire thématiques pour enrichir les textes',
          strategy2: 'Pratiquer la méthode du plan en 3 étapes avant chaque production écrite',
          
          parentHelp: 'Encourager la lecture quotidienne (20 minutes) et discuter des livres lus pour développer l\'esprit critique.',
          workPlan: 'Lire un chapitre par semaine, tenir un journal de vocabulaire, et écrire un court texte argumentatif tous les 10 jours.',
          
          generalAppreciation: 'Progression stable',
          finalComment: 'Lucas progresse de manière constante. Avec plus de rigueur dans la révision et la planification, il atteindra facilement ses objectifs.',
          
          tutorSignature: tutorName,
          signatureDate: '2026-02-15',
        },
      ];

      // Dans un vrai système, on filtrerait par tutorId
      setReports(mockReports);
    }
    setLoading(false);
  };

  const generateReportPDF = (report: ProgressReport) => {
    const doc = new jsPDF();
    let yPos = 20;

    // En-tête
    doc.setFontSize(18);
    doc.setTextColor(46, 92, 168);
    doc.text('RAPPORT DE PROGRESSION', 105, yPos, { align: 'center' });
    yPos += 10;
    
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.text('Tuto-Succès B&D', 105, yPos, { align: 'center' });
    yPos += 15;

    // Informations générales
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`Élève: ${report.studentName}`, 20, yPos);
    yPos += 6;
    doc.text(`Niveau scolaire: ${report.schoolLevel}`, 20, yPos);
    yPos += 6;
    doc.text(`École: ${report.school}`, 20, yPos);
    yPos += 6;
    doc.text(`Tuteur: ${report.tutorName}`, 20, yPos);
    yPos += 6;
    doc.text(`Parent/Responsable: ${report.parentName}`, 20, yPos);
    yPos += 6;
    doc.text(`Matière: ${report.subject}`, 20, yPos);
    yPos += 6;
    doc.text(`Date du rapport: ${new Date(report.reportDate).toLocaleDateString('fr-CA')}`, 20, yPos);
    yPos += 6;
    doc.text(`Nombre de séances: ${report.sessionsCount}`, 20, yPos);
    yPos += 6;
    doc.text(`Période: du ${new Date(report.firstSessionDate).toLocaleDateString('fr-CA')} au ${new Date(report.lastSessionDate).toLocaleDateString('fr-CA')}`, 20, yPos);
    yPos += 12;

    // Section 1: Objectifs
    doc.setFontSize(12);
    doc.setTextColor(46, 92, 168);
    doc.text('1. OBJECTIFS DES SÉANCES', 20, yPos);
    yPos += 8;
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const obj1Lines = doc.splitTextToSize(`• ${report.objective1}`, 170);
    doc.text(obj1Lines, 20, yPos);
    yPos += obj1Lines.length * 5;
    if (report.objective2) {
      const obj2Lines = doc.splitTextToSize(`• ${report.objective2}`, 170);
      doc.text(obj2Lines, 20, yPos);
      yPos += obj2Lines.length * 5;
    }
    yPos += 8;

    // Section 2: Progrès
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(12);
    doc.setTextColor(46, 92, 168);
    doc.text('2. PROGRÈS RÉALISÉS', 20, yPos);
    yPos += 8;
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const progLines = doc.splitTextToSize(report.progressDescription, 170);
    doc.text(progLines, 20, yPos);
    yPos += progLines.length * 5 + 5;
    
    doc.text(`Points forts: ${report.strengths}`, 20, yPos);
    yPos += 10;

    // Échelles
    doc.text(`Compréhension des notions: ${report.comprehensionLevel}/5`, 20, yPos);
    yPos += 5;
    doc.text(`Autonomie: ${report.autonomyLevel}/5`, 20, yPos);
    yPos += 5;
    doc.text(`Organisation: ${report.organizationLevel}/5`, 20, yPos);
    yPos += 5;
    doc.text(`Motivation: ${report.motivationLevel}/5`, 20, yPos);
    yPos += 10;

    // Section 3: Points à améliorer
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(12);
    doc.setTextColor(46, 92, 168);
    doc.text('3. POINTS À AMÉLIORER', 20, yPos);
    yPos += 8;
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const improveLines = doc.splitTextToSize(report.areasToImprove, 170);
    doc.text(improveLines, 20, yPos);
    yPos += improveLines.length * 5 + 8;

    // Section 4: Stratégies
    doc.setFontSize(12);
    doc.setTextColor(46, 92, 168);
    doc.text('4. STRATÉGIES PROCHAINES SÉANCES', 20, yPos);
    yPos += 8;
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const strat1Lines = doc.splitTextToSize(`• ${report.strategy1}`, 170);
    doc.text(strat1Lines, 20, yPos);
    yPos += strat1Lines.length * 5;
    const strat2Lines = doc.splitTextToSize(`• ${report.strategy2}`, 170);
    doc.text(strat2Lines, 20, yPos);
    yPos += strat2Lines.length * 5 + 8;

    // Section 5: Recommandations
    if (yPos > 230) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(12);
    doc.setTextColor(46, 92, 168);
    doc.text('5. RECOMMANDATIONS POUR LES PARENTS', 20, yPos);
    yPos += 8;
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const helpLines = doc.splitTextToSize(report.parentHelp, 170);
    doc.text(helpLines, 20, yPos);
    yPos += helpLines.length * 5 + 8;

    // Section 6: Appréciation
    doc.setFontSize(12);
    doc.setTextColor(46, 92, 168);
    doc.text('6. APPRÉCIATION GÉNÉRALE', 20, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.setTextColor(16, 185, 129);
    doc.text(`Statut: ${report.generalAppreciation}`, 20, yPos);
    yPos += 8;
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const finalLines = doc.splitTextToSize(report.finalComment, 170);
    doc.text(finalLines, 20, yPos);
    yPos += finalLines.length * 5 + 15;

    // Signature
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos, 100, yPos);
    yPos += 5;
    doc.text(`Signature: ${report.tutorSignature}`, 20, yPos);
    yPos += 5;
    doc.text(`Date: ${new Date(report.signatureDate).toLocaleDateString('fr-CA')}`, 20, yPos);

    doc.save(`Rapport_${report.studentName.replace(/\s+/g, '_')}_${report.reportDate}.pdf`);
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" style={{ color: '#2E5CA8' }} />
            Bilans de progression
          </CardTitle>
          <CardDescription>
            Les bilans apparaissent automatiquement après 3 séances avec le même élève
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.length === 0 ? (
              <div className="text-center py-12" style={{ color: '#7F8C8D' }}>
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="font-medium">Aucun bilan de progression</p>
                <p className="text-sm mt-2">
                  Les bilans seront générés automatiquement après 3 séances avec un élève.
                </p>
              </div>
            ) : (
              reports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold" style={{ color: '#2C3E50' }}>
                          {report.studentName}
                        </span>
                        <Badge
                          style={{
                            backgroundColor: report.generalAppreciation === 'En bonne progression' ? '#D1FAE5' : 
                                           report.generalAppreciation === 'Progression stable' ? '#FEF3C7' : '#FEE2E2',
                            color: report.generalAppreciation === 'En bonne progression' ? '#10b981' : 
                                   report.generalAppreciation === 'Progression stable' ? '#F59E0B' : '#E74C3C',
                            border: 'none',
                          }}
                        >
                          {report.generalAppreciation}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm" style={{ color: '#7F8C8D' }}>
                        <div><strong>Matière:</strong> {report.subject}</div>
                        <div><strong>Niveau:</strong> {report.schoolLevel}</div>
                        <div><strong>Séances:</strong> {report.sessionsCount}</div>
                        <div><strong>Date:</strong> {new Date(report.reportDate).toLocaleDateString('fr-CA')}</div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateReportPDF(report)}
                      style={{ borderColor: '#2E5CA8', color: '#2E5CA8' }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger PDF
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}