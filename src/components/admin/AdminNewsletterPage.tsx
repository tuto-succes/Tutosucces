import { useState, useEffect } from 'react';
import { Mail, Trash2, Download } from 'lucide-react';
import { supabase } from '../../app/core/supabase.client';
import { Button } from '../ui/button';

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

export function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  async function fetchSubscribers() {
    setLoading(true);
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setSubscribers(data ?? []);
    setLoading(false);
  }

  async function deleteSubscriber(id: string) {
    if (!confirm('Supprimer cet abonné ?')) return;
    const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
    if (!error) setSubscribers(prev => prev.filter(s => s.id !== id));
  }

  function exportCSV() {
    const rows = ['Email,Date inscription', ...subscribers.map(s =>
      `${s.email},${new Date(s.created_at).toLocaleDateString('fr-CA')}`
    )];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'infolettre-abonnes.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#2C3E50' }}>Infolettre</h2>
          <p className="text-sm mt-1" style={{ color: '#7F8C8D' }}>
            Liste des abonnés à l'infolettre ({subscribers.length} abonné{subscribers.length !== 1 ? 's' : ''})
          </p>
        </div>
        {subscribers.length > 0 && (
          <Button onClick={exportCSV} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exporter CSV
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12" style={{ color: '#7F8C8D' }}>Chargement...</div>
      ) : subscribers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <Mail className="h-12 w-12 mx-auto mb-4 opacity-30" style={{ color: '#7F8C8D' }} />
          <p className="font-medium" style={{ color: '#2C3E50' }}>Aucun abonné pour l'instant</p>
          <p className="text-sm mt-1" style={{ color: '#7F8C8D' }}>Les inscriptions depuis la page d'accueil apparaîtront ici.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#F8F9FA' }}>
                <th className="text-left px-6 py-3 text-sm font-semibold" style={{ color: '#7F8C8D' }}>#</th>
                <th className="text-left px-6 py-3 text-sm font-semibold" style={{ color: '#7F8C8D' }}>Adresse courriel</th>
                <th className="text-left px-6 py-3 text-sm font-semibold" style={{ color: '#7F8C8D' }}>Date d'inscription</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub, i) => (
                <tr key={sub.id} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm" style={{ color: '#7F8C8D' }}>{i + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" style={{ color: '#2E5CA8' }} />
                      <span className="font-medium" style={{ color: '#2C3E50' }}>{sub.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: '#7F8C8D' }}>
                    {new Date(sub.created_at).toLocaleDateString('fr-CA', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => deleteSubscriber(sub.id)}
                      className="p-1 rounded hover:bg-red-50 transition-colors"
                      style={{ color: '#E74C3C' }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
