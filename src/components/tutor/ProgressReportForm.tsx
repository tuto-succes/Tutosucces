import { useState } from 'react';
import { FileText, Save } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface ProgressReportFormProps {
  session: any;
  tutorName: string;
  onSave: (reportData: any) => void;
  onCancel: () => void;
}

export function ProgressReportForm({ session, tutorName, onSave, onCancel }: ProgressReportFormProps) {
  const [formData, setFormData] = useState({
    // Objectifs
    objective1: '',
    objective2: '',
    objective3: '',
    
    // Progrès
    progressDescription: '',
    strengths: '',
    participationComment: '',
    
    // Échelles (1-5)
    comprehensionLevel: 3,
    autonomyLevel: 3,
    organizationLevel: 3,
    motivationLevel: 3,
    
    // Points à améliorer
    areasToImprove: '',
    organizationImprovements: '',
    
    // Stratégies
    strategy1: '',
    strategy2: '',
    strategy3: '',
    
    // Recommandations
    parentHelp: '',
    workPlan: '',
    
    // Appréciation
    generalAppreciation: 'En bonne progression' as 'En bonne progression' | 'Progression stable' | 'À surveiller',
    finalComment: '',
  });

  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const validationErrors: string[] = [];
    if (!formData.objective1.trim()) validationErrors.push('Au moins un objectif est requis');
    if (!formData.progressDescription.trim()) validationErrors.push('Description des progrès requise');
    if (!formData.strengths.trim()) validationErrors.push('Points forts requis');
    if (!formData.participationComment.trim()) validationErrors.push('Commentaire sur la participation requis');
    if (!formData.areasToImprove.trim()) validationErrors.push('Points à améliorer requis');
    if (!formData.strategy1.trim() || !formData.strategy2.trim()) validationErrors.push('Au moins deux stratégies sont requises');
    if (!formData.parentHelp.trim()) validationErrors.push('Recommandations aux parents requises');
    if (!formData.workPlan.trim()) validationErrors.push('Plan de travail requis');
    if (!formData.finalComment.trim()) validationErrors.push('Commentaire final requis');

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Créer le rapport complet
    const report = {
      id: `report-${Date.now()}`,
      sessionId: session.id,
      studentId: session.studentId,
      studentName: session.studentName,
      tutorName: tutorName,
      schoolLevel: session.schoolLevel || 'Non spécifié',
      school: session.school || 'Non spécifié',
      parentName: session.parentName || 'Parent de ' + session.studentName,
      parentEmail: session.parentEmail || session.studentEmail,
      subject: session.subject,
      reportDate: new Date().toISOString().split('T')[0],
      sessionsCount: 3, // Minimum de séances pour créer un bilan
      firstSessionDate: session.firstSessionDate || session.date,
      lastSessionDate: session.date,
      ...formData,
      tutorSignature: tutorName,
      signatureDate: new Date().toISOString().split('T')[0],
    };

    onSave(report);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-2">
      {errors.length > 0 && (
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#f8d7da', borderColor: '#E74C3C' }}>
          <p className="font-semibold mb-2" style={{ color: '#721c24' }}>Veuillez corriger les erreurs suivantes :</p>
          <ul className="list-disc list-inside text-sm" style={{ color: '#721c24' }}>
            {errors.map((error, i) => <li key={i}>{error}</li>)}
          </ul>
        </div>
      )}

      {/* Informations de la séance */}
      <div className="p-4 rounded-lg" style={{ backgroundColor: '#E3F2FD' }}>
        <h3 className="font-semibold mb-2" style={{ color: '#2C3E50' }}>Informations de la séance</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="font-medium">Élève:</span> {session.studentName}</div>
          <div><span className="font-medium">Matière:</span> {session.subject}</div>
          <div><span className="font-medium">Date:</span> {new Date(session.date).toLocaleDateString('fr-FR')}</div>
          <div><span className="font-medium">Tuteur:</span> {tutorName}</div>
        </div>
      </div>

      {/* Section 1: Objectifs visés */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#2C3E50' }}>
          <FileText className="h-5 w-5" style={{ color: '#2E5CA8' }} />
          1. Objectifs visés
        </h3>
        <div className="space-y-3">
          <div>
            <Label htmlFor="objective1">Objectif 1 *</Label>
            <Textarea
              id="objective1"
              value={formData.objective1}
              onChange={(e) => setFormData({ ...formData, objective1: e.target.value })}
              placeholder="Ex: Renforcer la compréhension des fonctions quadratiques"
              rows={2}
              required
            />
          </div>
          <div>
            <Label htmlFor="objective2">Objectif 2</Label>
            <Textarea
              id="objective2"
              value={formData.objective2}
              onChange={(e) => setFormData({ ...formData, objective2: e.target.value })}
              placeholder="Ex: Améliorer les méthodes de résolution d'équations"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="objective3">Objectif 3</Label>
            <Textarea
              id="objective3"
              value={formData.objective3}
              onChange={(e) => setFormData({ ...formData, objective3: e.target.value })}
              placeholder="Ex: Développer l'autonomie dans la résolution de problèmes"
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Section 2: Progrès observés */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold" style={{ color: '#2C3E50' }}>
          2. Progrès observés
        </h3>
        <div className="space-y-3">
          <div>
            <Label htmlFor="progressDescription">Description des progrès *</Label>
            <Textarea
              id="progressDescription"
              value={formData.progressDescription}
              onChange={(e) => setFormData({ ...formData, progressDescription: e.target.value })}
              placeholder="Décrivez les progrès réalisés par l'élève depuis le début du cycle de séances"
              rows={4}
              required
            />
          </div>
          <div>
            <Label htmlFor="strengths">Points forts *</Label>
            <Textarea
              id="strengths"
              value={formData.strengths}
              onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
              placeholder="Ex: Excellente capacité d'analyse, bonne mémoire visuelle, persévérance"
              rows={2}
              required
            />
          </div>
          <div>
            <Label htmlFor="participationComment">Participation et motivation *</Label>
            <Textarea
              id="participationComment"
              value={formData.participationComment}
              onChange={(e) => setFormData({ ...formData, participationComment: e.target.value })}
              placeholder="Commentez l'implication et la motivation de l'élève pendant les séances"
              rows={2}
              required
            />
          </div>
        </div>
      </div>

      {/* Section 3: Évaluation par échelle */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold" style={{ color: '#2C3E50' }}>
          3. Évaluation (1 = Faible, 5 = Excellent)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="comprehensionLevel">Compréhension: {formData.comprehensionLevel}/5</Label>
            <input
              type="range"
              id="comprehensionLevel"
              min="1"
              max="5"
              value={formData.comprehensionLevel}
              onChange={(e) => setFormData({ ...formData, comprehensionLevel: parseInt(e.target.value) })}
              className="w-full"
              style={{ accentColor: '#2E5CA8' }}
            />
          </div>
          <div>
            <Label htmlFor="autonomyLevel">Autonomie: {formData.autonomyLevel}/5</Label>
            <input
              type="range"
              id="autonomyLevel"
              min="1"
              max="5"
              value={formData.autonomyLevel}
              onChange={(e) => setFormData({ ...formData, autonomyLevel: parseInt(e.target.value) })}
              className="w-full"
              style={{ accentColor: '#2E5CA8' }}
            />
          </div>
          <div>
            <Label htmlFor="organizationLevel">Organisation: {formData.organizationLevel}/5</Label>
            <input
              type="range"
              id="organizationLevel"
              min="1"
              max="5"
              value={formData.organizationLevel}
              onChange={(e) => setFormData({ ...formData, organizationLevel: parseInt(e.target.value) })}
              className="w-full"
              style={{ accentColor: '#2E5CA8' }}
            />
          </div>
          <div>
            <Label htmlFor="motivationLevel">Motivation: {formData.motivationLevel}/5</Label>
            <input
              type="range"
              id="motivationLevel"
              min="1"
              max="5"
              value={formData.motivationLevel}
              onChange={(e) => setFormData({ ...formData, motivationLevel: parseInt(e.target.value) })}
              className="w-full"
              style={{ accentColor: '#2E5CA8' }}
            />
          </div>
        </div>
      </div>

      {/* Section 4: Points à améliorer */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold" style={{ color: '#2C3E50' }}>
          4. Points à améliorer
        </h3>
        <div className="space-y-3">
          <div>
            <Label htmlFor="areasToImprove">Éléments à travailler *</Label>
            <Textarea
              id="areasToImprove"
              value={formData.areasToImprove}
              onChange={(e) => setFormData({ ...formData, areasToImprove: e.target.value })}
              placeholder="Identifiez les domaines qui nécessitent encore du travail"
              rows={3}
              required
            />
          </div>
          <div>
            <Label htmlFor="organizationImprovements">Suggestions d'amélioration de l'organisation</Label>
            <Textarea
              id="organizationImprovements"
              value={formData.organizationImprovements}
              onChange={(e) => setFormData({ ...formData, organizationImprovements: e.target.value })}
              placeholder="Ex: Améliorer la gestion du temps lors des examens"
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Section 5: Stratégies mises en place */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold" style={{ color: '#2C3E50' }}>
          5. Stratégies mises en place
        </h3>
        <div className="space-y-3">
          <div>
            <Label htmlFor="strategy1">Stratégie 1 *</Label>
            <Textarea
              id="strategy1"
              value={formData.strategy1}
              onChange={(e) => setFormData({ ...formData, strategy1: e.target.value })}
              placeholder="Ex: Utilisation de schémas et représentations visuelles"
              rows={2}
              required
            />
          </div>
          <div>
            <Label htmlFor="strategy2">Stratégie 2 *</Label>
            <Textarea
              id="strategy2"
              value={formData.strategy2}
              onChange={(e) => setFormData({ ...formData, strategy2: e.target.value })}
              placeholder="Ex: Décomposition des problèmes en étapes simples"
              rows={2}
              required
            />
          </div>
          <div>
            <Label htmlFor="strategy3">Stratégie 3</Label>
            <Textarea
              id="strategy3"
              value={formData.strategy3}
              onChange={(e) => setFormData({ ...formData, strategy3: e.target.value })}
              placeholder="Ex: Pratique régulière avec des exercices progressifs"
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Section 6: Recommandations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold" style={{ color: '#2C3E50' }}>
          6. Recommandations
        </h3>
        <div className="space-y-3">
          <div>
            <Label htmlFor="parentHelp">Comment les parents peuvent aider *</Label>
            <Textarea
              id="parentHelp"
              value={formData.parentHelp}
              onChange={(e) => setFormData({ ...formData, parentHelp: e.target.value })}
              placeholder="Suggestions pour le soutien parental à domicile"
              rows={3}
              required
            />
          </div>
          <div>
            <Label htmlFor="workPlan">Plan de travail pour les prochaines séances *</Label>
            <Textarea
              id="workPlan"
              value={formData.workPlan}
              onChange={(e) => setFormData({ ...formData, workPlan: e.target.value })}
              placeholder="Décrivez les prochaines étapes et objectifs"
              rows={3}
              required
            />
          </div>
        </div>
      </div>

      {/* Section 7: Appréciation générale */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold" style={{ color: '#2C3E50' }}>
          7. Appréciation générale
        </h3>
        <div className="space-y-3">
          <div>
            <Label htmlFor="generalAppreciation">Évaluation globale</Label>
            <Select 
              value={formData.generalAppreciation} 
              onValueChange={(value: any) => setFormData({ ...formData, generalAppreciation: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="En bonne progression">En bonne progression</SelectItem>
                <SelectItem value="Progression stable">Progression stable</SelectItem>
                <SelectItem value="À surveiller">À surveiller</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="finalComment">Commentaire final *</Label>
            <Textarea
              id="finalComment"
              value={formData.finalComment}
              onChange={(e) => setFormData({ ...formData, finalComment: e.target.value })}
              placeholder="Votre appréciation générale et encouragements pour l'élève"
              rows={4}
              required
            />
          </div>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white pb-2">
        <Button 
          type="submit" 
          className="flex-1"
          style={{ backgroundColor: '#E74C3C', color: 'white' }}
        >
          <Save className="h-4 w-4 mr-2" />
          Enregistrer le bilan
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="flex-1"
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}
