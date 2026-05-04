import { useState } from 'react';
import { Save, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { projectId } from '../../utils/supabase/info';
import { authenticatedPost } from '../../utils/auth-fetch';

interface SessionReportFormProps {
  session: any;
  tutorId: string;
  accessToken: string;
  onClose: () => void;
}

export function SessionReportForm({ session, tutorId, accessToken, onClose }: SessionReportFormProps) {
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [sessionObjective, setSessionObjective] = useState('');
  const [topicsCovered, setTopicsCovered] = useState('');
  const [workDone, setWorkDone] = useState('');
  const [studentEngagement, setStudentEngagement] = useState('Engagé');
  const [studentMood, setStudentMood] = useState('Neutre');
  const [difficulties, setDifficulties] = useState('');
  const [progress, setProgress] = useState('');
  const [homework, setHomework] = useState('');
  const [nextSessionFocus, setNextSessionFocus] = useState('');
  const [parentSummary, setParentSummary] = useState('');

  const formData = {
    sessionObjective,
    topicsCovered,
    workDone,
    studentEngagement,
    studentMood,
    difficulties,
    progress,
    homework,
    nextSessionFocus,
    parentSummary
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await authenticatedPost(
        `https://${projectId}.supabase.co/functions/v1/make-server-385c5805/session-reports`,
        {
          sessionId: session.id,
          tutorId,
          ...formData
        }
      );

      if (response.ok) {
        alert('Bilan créé avec succès !');
        onClose();
      } else {
        alert('Erreur lors de la création du bilan');
      }
    } catch (error) {
      console.error('Error creating report:', error);
      alert('Erreur lors de la création du bilan');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold" style={{ color: '#2C3E50' }}>Créer un bilan de séance</h3>
          <p className="text-sm mt-1" style={{ color: '#7F8C8D' }}>
            Séance du {new Date(session.date).toLocaleDateString('fr-FR')} - {session.subject}
          </p>
        </div>
        <Button onClick={onClose} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Annuler
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Formulaire de bilan (2-3 minutes)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Objectif principal */}
            <div className="space-y-2">
              <Label htmlFor="objective">Objectif principal de la séance *</Label>
              <Input
                id="objective"
                value={sessionObjective}
                onChange={(e) => setSessionObjective(e.target.value)}
                placeholder="Ex: Réviser les équations du second degré"
                required
              />
            </div>

            {/* Concepts travaillés */}
            <div className="space-y-2">
              <Label htmlFor="topics">Concepts, chapitres, exercices travaillés *</Label>
              <Textarea
                id="topics"
                value={topicsCovered}
                onChange={(e) => setTopicsCovered(e.target.value)}
                placeholder="Détaillez les sujets abordés pendant la séance"
                rows={3}
                required
              />
            </div>

            {/* Ce qui a été fait */}
            <div className="space-y-2">
              <Label htmlFor="workDone">Ce qui a été fait concrètement *</Label>
              <Textarea
                id="workDone"
                value={workDone}
                onChange={(e) => setWorkDone(e.target.value)}
                placeholder="Ex: Exercices 1-5 du manuel, correction du devoir, révision quiz"
                rows={3}
                required
              />
            </div>

            {/* Perception du tuteur */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="engagement">Niveau d'engagement de l'élève *</Label>
                <Select value={studentEngagement} onValueChange={setStudentEngagement}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Très engagé">Très engagé</SelectItem>
                    <SelectItem value="Engagé">Engagé</SelectItem>
                    <SelectItem value="Peu engagé">Peu engagé</SelectItem>
                    <SelectItem value="Difficile">Difficile</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mood">Humeur générale de l'élève *</Label>
                <Select value={studentMood} onValueChange={setStudentMood}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Très positif">Très positif</SelectItem>
                    <SelectItem value="Neutre">Neutre</SelectItem>
                    <SelectItem value="Fatigué">Fatigué</SelectItem>
                    <SelectItem value="Stressé">Stressé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Points qui ont posé problème */}
            <div className="space-y-2">
              <Label htmlFor="difficulties">Points qui ont posé problème</Label>
              <Textarea
                id="difficulties"
                value={difficulties}
                onChange={(e) => setDifficulties(e.target.value)}
                placeholder="Notez les difficultés rencontrées pendant la séance"
                rows={2}
              />
            </div>

            {/* Progrès */}
            <div className="space-y-2">
              <Label htmlFor="progress">Ce qui s'est bien passé / progrès visibles</Label>
              <Textarea
                id="progress"
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                placeholder="Notez les points positifs et les progrès observés"
                rows={2}
              />
            </div>

            {/* Devoirs */}
            <div className="space-y-2">
              <Label htmlFor="homework">Devoirs / tâches à faire *</Label>
              <Textarea
                id="homework"
                value={homework}
                onChange={(e) => setHomework(e.target.value)}
                placeholder="Listez les devoirs et tâches assignés pour la prochaine fois"
                rows={3}
                required
              />
            </div>

            {/* Prochaine séance */}
            <div className="space-y-2">
              <Label htmlFor="nextFocus">À quoi on va se consacrer à la prochaine séance *</Label>
              <Textarea
                id="nextFocus"
                value={nextSessionFocus}
                onChange={(e) => setNextSessionFocus(e.target.value)}
                placeholder="Planifiez les objectifs de la prochaine rencontre"
                rows={3}
                required
              />
            </div>

            {/* Résumé pour les parents */}
            <div className="space-y-2 bg-green-50 p-4 rounded-lg border-2 border-green-200">
              <Label htmlFor="parentSummary">Résumé pour les parents (3-4 phrases simples) *</Label>
              <Textarea
                id="parentSummary"
                value={parentSummary}
                onChange={(e) => setParentSummary(e.target.value)}
                placeholder="Rédigez un résumé clair et positif pour les parents (ce sera visible dans leur espace)"
                rows={4}
                required
                className="bg-white"
              />
              <p className="text-xs text-green-700">
                Ce résumé sera directement visible par les parents dans leur espace.
              </p>
            </div>

            {/* Boutons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={saving}
                className="flex-1"
                style={{ backgroundColor: '#E74C3C', color: 'white' }}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Enregistrement...' : 'Enregistrer le bilan'}
              </Button>
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}