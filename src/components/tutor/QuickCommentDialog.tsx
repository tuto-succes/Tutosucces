import { useState } from 'react';
import { MessageSquare, Save, X } from 'lucide-react';
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
  onSaved?: (comment: string) => void | Promise<void>;
  completionRequired?: boolean;
}

export function QuickCommentDialog({
  session,
  onClose,
  onSuccess,
  onSaved,
  completionRequired = false,
}: QuickCommentDialogProps) {
  const [comment, setComment] = useState(session.tutorComment || '');
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(session.tutorComment);

  async function handleSave() {
    if (!comment.trim()) {
      alert("Veuillez entrer un commentaire avant d'enregistrer.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from('session_comments')
      .upsert(
        {
          session_id: session.id,
          author_id: session.tutorId,
          author_role: 'tutor',
          comment: comment.trim(),
          is_visible_to_student: true,
          is_visible_to_parent: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'session_id,author_id' }
      );

    setSaving(false);

    if (error) {
      console.error('Error saving comment:', error);
      alert("Erreur lors de l'enregistrement du commentaire");
      return;
    }

    if (onSaved) {
      await onSaved(comment.trim());
    }

    onSuccess();
    onClose();
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                {completionRequired
                  ? 'Commentaire obligatoire avant de terminer la seance'
                  : isEditing
                    ? 'Modifier le commentaire'
                    : 'Ajouter un commentaire'}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {completionRequired
                  ? `Ajoutez un commentaire pour la seance du ${new Date(session.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} avant de la marquer comme terminee.`
                  : `Seance du ${new Date(session.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} - ${session.subject}`}
              </DialogDescription>
            </div>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="comment">Commentaire de seance</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Decrivez brievement la seance : ce qui a ete travaille, les points forts, les defis rencontres..."
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              {completionRequired
                ? "Ce commentaire est obligatoire et sera visible par l'eleve et les parents."
                : "Ce commentaire sera visible par l'eleve et les parents."}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button onClick={onClose} variant="outline">
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              style={{ backgroundColor: '#2E5CA8', color: 'white' }}
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Enregistrement...' : isEditing ? 'Modifier' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
