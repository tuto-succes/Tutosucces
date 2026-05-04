import { useState } from 'react';
import { MessageSquare, X, Save } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';

interface QuickCommentDialogProps {
  session: any;
  accessToken: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function QuickCommentDialog({ session, accessToken, onClose, onSuccess }: QuickCommentDialogProps) {
  const [comment, setComment] = useState(session.tutorComment || '');
  const [saving, setSaving] = useState(false);
  
  const isEditing = Boolean(session.tutorComment);

  async function handleSave() {
    if (!comment.trim()) {
      alert('Veuillez entrer un commentaire avant d\'enregistrer.');
      return;
    }
    
    setSaving(true);
    try {
      // Simulation de mise à jour pour mock
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mettre à jour le commentaire dans localStorage
      const storedSessions = localStorage.getItem('mockSessions');
      if (storedSessions) {
        const sessions = JSON.parse(storedSessions);
        const updatedSessions = sessions.map((s: any) => 
          s.id === session.id ? { ...s, tutorComment: comment } : s
        );
        localStorage.setItem('mockSessions', JSON.stringify(updatedSessions));
      }
      
      alert(isEditing ? 'Commentaire modifié avec succès !' : 'Commentaire ajouté avec succès !');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving comment:', error);
      alert('Erreur lors de l\'enregistrement du commentaire');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-2xl">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" style={{ color: '#2E5CA8' }} />
                {isEditing ? 'Modifier le commentaire de séance' : 'Ajouter un commentaire de séance'}
              </DialogTitle>
              <DialogDescription className="mt-2">
                Séance du {new Date(session.date).toLocaleDateString('fr-FR')} - {session.subject}
              </DialogDescription>
            </div>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="comment">Votre commentaire rapide</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Décrivez brièvement la séance : ce qui a été travaillé, les points forts, les défis rencontrés..."
              rows={6}
              className="resize-none"
            />
            <p className="text-xs" style={{ color: '#7F8C8D' }}>
              Ce commentaire sera visible par l'élève et les parents.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm" style={{ color: '#2E5CA8' }}>
              💡 <strong>Astuce :</strong> Pour un bilan complet (à partir de la 3ème séance), rendez-vous dans l'onglet "Bilans".
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button onClick={onClose} variant="outline">
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              style={{ backgroundColor: '#2E5CA8', color: 'white' }}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Enregistrement...' : (isEditing ? 'Modifier le commentaire' : 'Enregistrer le commentaire')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}