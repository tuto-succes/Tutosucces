import { useState, useEffect, type ReactNode } from 'react';
import { FileText, Calendar, User, ChevronDown, ChevronUp, TrendingUp, Target, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { supabase } from '../../app/core/supabase.client';

interface ProgressReportsProps {
  userId: string;
  accessToken: string;
}

export function ProgressReports({ userId }: ProgressReportsProps) {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, [userId]);

  async function fetchReports() {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('progress_reports')
        .select('*')
        .eq('student_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const tutorIds = [...new Set((data || []).map((report: any) => report.tutor_id))];
      const { data: tutors } = tutorIds.length > 0
        ? await supabase.from('profiles').select('id, name').in('id', tutorIds)
        : { data: [] };

      const tutorMap: Record<string, string> = {};
      (tutors || []).forEach((tutor: any) => {
        tutorMap[tutor.id] = tutor.name;
      });

      const mappedReports = (data || []).map((report: any) => ({
        ...report,
        tutorName: tutorMap[report.tutor_id] || 'Tuteur',
      }));

      setReports(mappedReports);
    } catch (error) {
      console.error('Error fetching progress reports:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }

  const reportsByTutor: Record<string, any[]> = {};
  reports.forEach(report => {
    if (!reportsByTutor[report.tutorName]) {
      reportsByTutor[report.tutorName] = [];
    }
    reportsByTutor[report.tutorName].push(report);
  });

  if (loading) {
    return <div className="text-center py-8">Chargement des bilans...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#2C3E50' }}>
          Mes bilans de progression
        </h2>
        <p className="text-sm mt-1" style={{ color: '#7F8C8D' }}>
          Retrouvez ici tous les bilans pedagogiques prepares par vos tuteurs.
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
          <CardContent>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
              <FileText className="h-4 w-4" />
              Bilans disponibles
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Matieres suivies</CardDescription>
            <CardTitle className="text-3xl" style={{ color: '#F39C12' }}>
              {new Set(reports.map(report => report.subject)).size}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
              <BookOpen className="h-4 w-4" />
              Matieres differentes
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Tuteurs actifs</CardDescription>
            <CardTitle className="text-3xl" style={{ color: '#E74C3C' }}>
              {Object.keys(reportsByTutor).length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
              <User className="h-4 w-4" />
              Tuteurs differents
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" style={{ color: '#2E5CA8' }} />
            Bilans de progression
          </CardTitle>
          <CardDescription>
            Historique de tous vos bilans enregistres
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-12" style={{ color: '#7F8C8D' }}>
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="font-medium">Aucun bilan disponible</p>
              <p className="text-sm mt-2">
                Les bilans apparaitront ici apres les seances completes avec rapport pedagogique.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(reportsByTutor).map(([tutorName, tutorReports]) => (
                <div key={tutorName} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: '#2E5CA8' }}>
                          {tutorName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: '#2C3E50' }}>{tutorName}</p>
                          <p className="text-sm" style={{ color: '#7F8C8D' }}>
                            {tutorReports.length} bilan{tutorReports.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="divide-y">
                    {tutorReports.map(report => (
                      <div key={report.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <Badge variant="outline" style={{ borderColor: '#2E5CA8', color: '#2E5CA8' }}>
                                {report.subject}
                              </Badge>
                              <Badge style={{ backgroundColor: '#EBF4FF', color: '#2E5CA8', border: 'none' }}>
                                Seance #{report.session_number}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
                              <Calendar className="h-4 w-4" />
                              {new Date(report.created_at || report.updated_at).toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
                            style={{ color: '#2E5CA8' }}
                          >
                            {expandedReport === report.id ? (
                              <>
                                <ChevronUp className="h-4 w-4 mr-1" />
                                Masquer
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4 mr-1" />
                                Details
                              </>
                            )}
                          </Button>
                        </div>

                        {expandedReport === report.id && (
                          <div className="mt-4 space-y-4 pt-4 border-t">
                            <ReportSection
                              title="Points forts"
                              icon={<TrendingUp className="h-4 w-4" />}
                              color="#10b981"
                              content={report.strengths}
                            />
                            <ReportSection
                              title="Points a ameliorer"
                              icon={<Target className="h-4 w-4" />}
                              color="#E74C3C"
                              content={report.areas_to_improve}
                            />
                            <ReportSection
                              title="Sujets abordes"
                              icon={<BookOpen className="h-4 w-4" />}
                              color="#2E5CA8"
                              content={report.topics_covered}
                            />
                            <ReportSection
                              title="Devoirs / plan de travail"
                              icon={<FileText className="h-4 w-4" />}
                              color="#F39C12"
                              content={report.homework_assigned}
                            />
                            <ReportSection
                              title="Objectifs de la prochaine seance"
                              icon={<Target className="h-4 w-4" />}
                              color="#8B5CF6"
                              content={report.next_session_goals}
                            />
                            <ReportSection
                              title="Commentaire du tuteur"
                              icon={<User className="h-4 w-4" />}
                              color="#2C3E50"
                              content={report.tutor_comments}
                            />
                          </div>
                        )}
                      </div>
                    ))}
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

function ReportSection({ title, icon, color, content }: { title: string; icon: ReactNode; color: string; content?: string | null }) {
  if (!content) {
    return null;
  }

  return (
    <div>
      <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color }}>
        {icon}
        {title}
      </h4>
      <div className="rounded-lg p-4" style={{ backgroundColor: '#F8FAFC' }}>
        <p className="text-sm whitespace-pre-wrap" style={{ color: '#2C3E50' }}>
          {content}
        </p>
      </div>
    </div>
  );
}
