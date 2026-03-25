import { useState } from 'react';
import { MessageSquare, X, Save } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { supabase } from '../../app/core/supabase.client';

interface QuickCommentDialogProps {
  session: any;
  accessToken?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function QuickCommentDialog({ session, onClose, onSuccess }: QuickCommentDialogProps) {
  const [comment, setComment] = useState(session.tutorComment || '');
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(session.tutorComment);

  async function handleSave() {
    if (!comment.trim()) {
      alert('Veuillez entrer un commentaire avant d\'enregistrer.');
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('sessions')
      .update({ tutor_notes: comment.trim() })
      .eq('id', session.id);

    setSaving(false);

    if (error) {
      console.error('Error saving comment:', error);
      alert('Erreur lors de l\'enregistrement du commentaire');
      return;
    }

    onSuccess();
    onClose();
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-2xl">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                {isEditing ? 'Modifier le commentaire' : 'Ajouter un commentaire'}
              </DialogTitle>
              <DialogDescription className="mt-1">
                Séance du {new Date(session.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} — {session.subject}
              </DialogDescription>
            </div>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="comment">Commentaire de séance</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Décrivez brièvement la séance : ce qui a été travaillé, les points forts, les défis rencontrés..."
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              Ce commentaire sera visible par l'élève et les parents.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button onClick={onClose} variant="outline">Annuler</Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              style={{ backgroundColor: '#2E5CA8', color: 'white' }}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Enregistrer')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
