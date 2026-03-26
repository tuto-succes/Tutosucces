import { useState, useEffect, type ReactNode } from 'react';
import { FileText, Download, Calendar, User, BookOpen, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import jsPDF from 'jspdf';
import { supabase } from '../../app/core/supabase.client';

export function TutorProgressReports({ tutorId, tutorName }: { tutorId: string; tutorName: string }) {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgressReports();
  }, [tutorId]);

  async function loadProgressReports() {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('progress_reports')
        .select('*')
        .eq('tutor_id', tutorId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const studentIds = [...new Set((data || []).map((report: any) => report.student_id))];
      const { data: students } = studentIds.length > 0
        ? await supabase.from('profiles').select('id, name, email').in('id', studentIds)
        : { data: [] };

      const studentMap: Record<string, any> = {};
      (students || []).forEach((student: any) => {
        studentMap[student.id] = student;
      });

      const mappedReports = (data || []).map((report: any) => ({
        ...report,
        studentName: studentMap[report.student_id]?.name || 'Eleve',
        parentEmail: studentMap[report.student_id]?.email || '',
        tutorName,
      }));

      setReports(mappedReports);
    } catch (error) {
      console.error('Error loading tutor reports:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }

  function generateReportPDF(report: any) {
    const doc = new jsPDF();
    let yPos = 20;

    doc.setFontSize(18);
    doc.setTextColor(46, 92, 168);
    doc.text('RAPPORT DE PROGRESSION', 105, yPos, { align: 'center' });
    yPos += 10;

    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.text('Tuto-Succes B&D', 105, yPos, { align: 'center' });
    yPos += 14;

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`Eleve: ${report.studentName}`, 20, yPos); yPos += 6;
    doc.text(`Tuteur: ${tutorName}`, 20, yPos); yPos += 6;
    doc.text(`Matiere: ${report.subject}`, 20, yPos); yPos += 6;
    doc.text(`Date du rapport: ${new Date(report.created_at || report.updated_at).toLocaleDateString('fr-CA')}`, 20, yPos); yPos += 6;
    doc.text(`Numero de seance: ${report.session_number}`, 20, yPos); yPos += 10;

    const blocks = [
      { title: 'Points forts', content: report.strengths },
      { title: 'Points a ameliorer', content: report.areas_to_improve },
      { title: 'Sujets abordes', content: report.topics_covered },
      { title: 'Devoirs / plan de travail', content: report.homework_assigned },
      { title: 'Objectifs prochaine seance', content: report.next_session_goals },
      { title: 'Commentaires du tuteur', content: report.tutor_comments },
    ];

    blocks.forEach(block => {
      if (!block.content) {
        return;
      }

      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setTextColor(46, 92, 168);
      doc.text(block.title.toUpperCase(), 20, yPos);
      yPos += 8;

      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      const lines = doc.splitTextToSize(block.content, 170);
      doc.text(lines, 20, yPos);
      yPos += lines.length * 5 + 8;
    });

    doc.save(`Bilan_${report.studentName.replace(/\s+/g, '_')}_${report.subject}.pdf`);
  }

  if (loading) {
    return <div className="text-center py-8">Chargement des bilans...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold" style={{ color: '#2C3E50' }}>
          Bilans de progression
        </h3>
        <p className="text-sm mt-1" style={{ color: '#7F8C8D' }}>
          Tous les bilans pedagogiques que vous avez enregistres.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total de bilans</CardDescription>
            <CardTitle className="text-3xl" style={{ color: '#2E5CA8' }}>
              {reports.length}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Eleves suivis</CardDescription>
            <CardTitle className="text-3xl" style={{ color: '#F39C12' }}>
              {new Set(reports.map(report => report.student_id)).size}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Matieres</CardDescription>
            <CardTitle className="text-3xl" style={{ color: '#10b981' }}>
              {new Set(reports.map(report => report.subject)).size}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" style={{ color: '#2E5CA8' }} />
            Mes bilans
          </CardTitle>
          <CardDescription>
            Historique complet des bilans saisis apres les seances
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-12" style={{ color: '#7F8C8D' }}>
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="font-medium">Aucun bilan enregistre</p>
              <p className="text-sm mt-2">
                Vos bilans apparaitront ici apres leur sauvegarde.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map(report => (
                <div key={report.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-lg font-semibold" style={{ color: '#2C3E50' }}>
                          {report.studentName}
                        </h4>
                        <Badge variant="outline" style={{ borderColor: '#2E5CA8', color: '#2E5CA8' }}>
                          {report.subject}
                        </Badge>
                        <Badge style={{ backgroundColor: '#EBF4FF', color: '#2E5CA8', border: 'none' }}>
                          Seance #{report.session_number}
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3 text-sm" style={{ color: '#7F8C8D' }}>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(report.created_at || report.updated_at).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {report.parentEmail || 'Email parent non disponible'}
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <MiniBlock title="Points forts" icon={<TrendingUp className="h-4 w-4" />} color="#10b981" content={report.strengths} />
                        <MiniBlock title="A ameliorer" icon={<Target className="h-4 w-4" />} color="#E74C3C" content={report.areas_to_improve} />
                        <MiniBlock title="Sujets abordes" icon={<BookOpen className="h-4 w-4" />} color="#2E5CA8" content={report.topics_covered} />
                        <MiniBlock title="Commentaires" icon={<FileText className="h-4 w-4" />} color="#2C3E50" content={report.tutor_comments} />
                      </div>
                    </div>

                    <Button onClick={() => generateReportPDF(report)} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MiniBlock({ title, icon, color, content }: { title: string; icon: ReactNode; color: string; content?: string | null }) {
  if (!content) {
    return null;
  }

  return (
    <div className="rounded-lg p-4" style={{ backgroundColor: '#F8FAFC' }}>
      <h5 className="mb-2 flex items-center gap-2 font-semibold" style={{ color }}>
        {icon}
        {title}
      </h5>
      <p className="text-sm whitespace-pre-wrap" style={{ color: '#2C3E50' }}>
        {content}
      </p>
    </div>
  );
}
