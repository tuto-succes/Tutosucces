// ============================================================
// TUTOSUCCÈS - Service de base de données Supabase
// Remplace toutes les fonctions mock par de vraies requêtes
// ============================================================

import { supabase } from './client';

// ── Helpers de mapping (snake_case → camelCase) ─────────────

function mapSession(row: any) {
  return {
    id: row.session_id,
    studentId: row.student_id,
    tutorId: row.tutor_id,
    studentName: row.student_name,
    tutorName: row.tutor_name,
    date: row.session_date,
    time: row.session_time,
    duration: Number(row.duration),
    subject: row.subject,
    status: row.status,
    notes: row.notes ?? null,
    zoomLink: row.zoom_link ?? null,
    tutorComment: row.tutor_comment ?? null,
  };
}

function mapPayment(row: any) {
  return {
    id: row.payment_id,
    studentId: row.student_id,
    tutorId: row.tutor_id,
    sessionId: row.session_id,
    invoiceId: row.invoice_id,
    amount: Number(row.amount),
    status: row.status,
    date: row.payment_date,
    method: row.method,
    tutorName: row.tutor_name,
    studentName: row.student_name,
    subject: row.subject,
    duration: Number(row.duration),
    rate: Number(row.rate),
  };
}

function mapInvoice(row: any) {
  return {
    id: row.id,
    invoiceId: row.invoice_id,
    studentId: row.student_id,
    clientName: row.client_name,
    clientEmail: row.client_email,
    studentName: row.student_name,
    invoiceDate: row.invoice_date,
    dueDate: row.due_date,
    paymentStatus: row.payment_status as 'Payé' | 'À payer' | 'En retard',
    subtotal: Number(row.subtotal),
    discountAmount: Number(row.discount_amount ?? 0),
    taxAmountGST: Number(row.tax_amount_gst ?? 0),
    taxAmountQST: Number(row.tax_amount_qst ?? 0),
    totalDue: Number(row.total_due),
    lineItems: row.line_items ?? [],
    paymentLinkUrl: row.payment_link_url ?? null,
  };
}

function mapProfile(row: any) {
  return {
    id: row.user_id,
    userId: row.user_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    subjects: row.subjects ?? [],
    levels: row.levels ?? [],
    mode: row.mode ?? [],
    rate: row.rate ? Number(row.rate) : null,
    bio: row.bio ?? null,
    rating: row.rating ? Number(row.rating) : null,
    reviewCount: row.review_count ?? 0,
    approved: row.approved ?? false,
    studentLevel: row.student_level ?? null,
    parentName: row.parent_name ?? null,
    parentEmail: row.parent_email ?? null,
    created_at: row.created_at,
  };
}

function mapMessage(row: any) {
  return {
    id: row.message_id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    senderName: row.sender_name,
    receiverId: row.receiver_id,
    recipientId: row.recipient_id,
    content: row.content,
    read: row.read,
    timestamp: row.timestamp,
    createdAt: row.created_at,
  };
}

function mapProgressReport(row: any) {
  return {
    id: row.report_id,
    studentId: row.student_id,
    tutorId: row.tutor_id,
    studentName: row.student_name,
    tutorName: row.tutor_name,
    reportDate: row.report_date,
    subject: row.subject,
    sessionNumber: row.session_number,
    strengths: row.strengths,
    areasForImprovement: row.areas_for_improvement,
    recommendations: row.recommendations,
    overallProgress: row.overall_progress,
    nextSteps: row.next_steps ?? null,
    createdAt: row.created_at,
  };
}

function mapTaxReceipt(row: any) {
  return {
    id: row.receipt_id,
    userId: row.user_id,
    userType: row.user_type,
    year: row.year,
    totalAmount: Number(row.total_amount),
    details: row.details ?? {},
    status: row.status,
    createdAt: row.created_at,
  };
}

// ── SESSIONS ────────────────────────────────────────────────

export async function getSessions(userId?: string, role?: 'student' | 'tutor') {
  let query = supabase
    .from('sessions')
    .select('*')
    .order('session_date', { ascending: false });

  if (userId && role === 'student') {
    query = query.eq('student_id', userId);
  } else if (userId && role === 'tutor') {
    query = query.eq('tutor_id', userId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapSession);
}

export async function updateSession(sessionId: string, updates: Record<string, any>) {
  const { error } = await supabase
    .from('sessions')
    .update(updates)
    .eq('session_id', sessionId);
  if (error) throw error;
}

// ── TUTEURS ─────────────────────────────────────────────────

export async function getTutors() {
  // Charger les profils tuteurs
  const { data: profiles, error: profErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'tutor')
    .eq('approved', true);
  if (profErr) throw profErr;

  // Charger les disponibilités
  const { data: avails, error: availErr } = await supabase
    .from('tutor_availability')
    .select('*');
  if (availErr) throw availErr;

  // Grouper les disponibilités par tuteur
  const availMap: Record<string, any[]> = {};
  (avails ?? []).forEach((a: any) => {
    if (!availMap[a.tutor_id]) availMap[a.tutor_id] = [];
    // Regrouper les slots du même jour
    const existing = availMap[a.tutor_id].find((d: any) => d.dayOfWeek === a.day_of_week);
    if (existing) {
      existing.slots.push({ start: a.start_time, end: a.end_time });
    } else {
      availMap[a.tutor_id].push({
        dayOfWeek: a.day_of_week,
        slots: [{ start: a.start_time, end: a.end_time }],
      });
    }
  });

  return (profiles ?? []).map((p: any) => ({
    userId: p.user_id,
    user: { name: p.name, email: p.email },
    subjects: p.subjects ?? [],
    levels: p.levels ?? [],
    mode: p.mode ?? [],
    rate: Number(p.rate ?? 0),
    bio: p.bio ?? '',
    rating: Number(p.rating ?? 0),
    reviewCount: p.review_count ?? 0,
    approved: p.approved ?? false,
    availability: availMap[p.user_id] ?? [],
  }));
}

export async function getTutorProfile(tutorId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', tutorId)
    .single();
  if (error) throw error;
  return {
    id: data.user_id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    rating: Number(data.rating ?? 0),
    reviewCount: data.review_count ?? 0,
    active: data.approved ?? false,
    subjects: data.subjects ?? [],
    levels: data.levels ?? [],
    mode: data.mode ?? [],
    hourlyRate: Number(data.rate ?? 0),
    bio: data.bio ?? '',
  };
}

export async function updateTutorProfile(tutorId: string, updates: {
  bio?: string;
  subjects?: string[];
  levels?: string[];
  mode?: string[];
  rate?: number;
}) {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', tutorId);
  if (error) throw error;
}

export async function getAllSubjects(): Promise<string[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('subjects')
    .eq('role', 'tutor')
    .eq('approved', true);
  if (error) throw error;
  const set = new Set<string>();
  (data ?? []).forEach((p: any) => (p.subjects ?? []).forEach((s: string) => set.add(s)));
  return Array.from(set).sort();
}

// ── PAIEMENTS ───────────────────────────────────────────────

export async function getPayments(userId: string, role: 'student' | 'tutor' = 'student') {
  const column = role === 'student' ? 'student_id' : 'tutor_id';
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq(column, userId)
    .order('payment_date', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapPayment);
}

// ── FACTURES ────────────────────────────────────────────────

export async function getInvoices(userId: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('student_id', userId)
    .order('invoice_date', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapInvoice);
}

export async function getAllInvoices() {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('invoice_date', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapInvoice);
}

// ── MESSAGES ────────────────────────────────────────────────

export async function getMessages(userId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('timestamp', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapMessage);
}

export async function sendMessage(message: {
  messageId: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
}) {
  const { error } = await supabase.from('messages').insert({
    message_id: message.messageId,
    conversation_id: message.conversationId,
    sender_id: message.senderId,
    sender_name: message.senderName,
    receiver_id: message.receiverId,
    recipient_id: message.receiverId,
    content: message.content,
    read: false,
    timestamp: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function markMessagesRead(conversationId: string, userId: string) {
  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('conversation_id', conversationId)
    .eq('receiver_id', userId);
  if (error) throw error;
}

// ── PROFILS UTILISATEURS ────────────────────────────────────

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) throw error;
  return mapProfile(data);
}

export async function updateUserProfile(userId: string, updates: {
  name?: string;
  phone?: string;
  student_level?: string;
  parent_name?: string;
  parent_email?: string;
}) {
  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
  if (error) throw error;
}

export async function getUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapProfile);
}

export async function updateUser(userId: string, updates: Record<string, any>) {
  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
  if (error) throw error;
}

// ── BILANS DE PROGRESSION ───────────────────────────────────

export async function getProgressReports(userId: string, role: 'student' | 'tutor') {
  const column = role === 'student' ? 'student_id' : 'tutor_id';
  const { data, error } = await supabase
    .from('progress_reports')
    .select('*')
    .eq(column, userId)
    .order('report_date', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapProgressReport);
}

export async function createProgressReport(report: {
  reportId: string;
  studentId: string;
  tutorId: string;
  studentName: string;
  tutorName: string;
  reportDate: string;
  subject: string;
  sessionNumber: number;
  strengths: string;
  areasForImprovement: string;
  recommendations: string;
  overallProgress: string;
  nextSteps?: string;
}) {
  const { error } = await supabase.from('progress_reports').insert({
    report_id: report.reportId,
    student_id: report.studentId,
    tutor_id: report.tutorId,
    student_name: report.studentName,
    tutor_name: report.tutorName,
    report_date: report.reportDate,
    subject: report.subject,
    session_number: report.sessionNumber,
    strengths: report.strengths,
    areas_for_improvement: report.areasForImprovement,
    recommendations: report.recommendations,
    overall_progress: report.overallProgress,
    next_steps: report.nextSteps ?? null,
  });
  if (error) throw error;
}

// ── RELEVÉS FISCAUX ─────────────────────────────────────────

export async function getTaxReceipts(userId: string) {
  const { data, error } = await supabase
    .from('tax_receipts')
    .select('*')
    .eq('user_id', userId)
    .order('year', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapTaxReceipt);
}

// ── REVENUS TUTEURS (calculé à partir des paiements) ────────

export async function getPayrollRecords(tutorId: string) {
  // Récupérer tous les paiements du tuteur
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('tutor_id', tutorId)
    .order('payment_date', { ascending: false });
  if (error) throw error;

  const payments = (data ?? []).map(mapPayment);

  // Grouper par semaine
  const weekMap: Record<string, any> = {};
  payments.forEach((p) => {
    const date = new Date(p.date);
    // Début de semaine (lundi)
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1 - day);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const key = weekStart.toISOString().split('T')[0];
    if (!weekMap[key]) {
      weekMap[key] = {
        id: `PAY-${key}`,
        tutorId,
        periodStart: weekStart.toISOString(),
        periodEnd: weekEnd.toISOString(),
        status: p.status === 'completed' ? 'paid' : 'pending',
        totalHours: 0,
        totalAmount: 0,
        sessions: [],
        paymentDate: p.status === 'completed' ? p.date : null,
      };
    }
    weekMap[key].totalHours += p.duration;
    weekMap[key].totalAmount += p.amount;
    weekMap[key].sessions.push({
      date: p.date,
      studentName: p.studentName,
      subject: p.subject,
      duration: p.duration,
      rate: p.rate,
      amount: p.amount,
    });
  });

  const records = Object.values(weekMap);
  // Marquer la semaine en cours
  const now = new Date();
  const currentWeekStart = new Date(now);
  const day = now.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  currentWeekStart.setDate(now.getDate() + diff);
  currentWeekStart.setHours(0, 0, 0, 0);
  const currentKey = currentWeekStart.toISOString().split('T')[0];
  if (weekMap[currentKey]) {
    weekMap[currentKey].status = 'current';
  }

  return records.sort((a: any, b: any) =>
    new Date(b.periodStart).getTime() - new Date(a.periodStart).getTime()
  );
}

// ── MESSAGES DE CONTACT ─────────────────────────────────────

export async function getContactMessages() {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updateContactMessageStatus(id: string, status: 'new' | 'in_progress' | 'resolved') {
  const { error } = await supabase
    .from('contact_messages')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
}

// ── DISPONIBILITÉS ───────────────────────────────────────────

export async function getTutorAvailability(tutorId: string) {
  const { data, error } = await supabase
    .from('tutor_availability')
    .select('*')
    .eq('tutor_id', tutorId);
  if (error) throw error;

  const map: Record<number, { start: string; end: string }[]> = {};
  (data ?? []).forEach((a: any) => {
    if (!map[a.day_of_week]) map[a.day_of_week] = [];
    map[a.day_of_week].push({ start: a.start_time, end: a.end_time });
  });
  return Object.entries(map).map(([day, slots]) => ({
    dayOfWeek: Number(day),
    slots,
  }));
}

export async function setTutorAvailability(
  tutorId: string,
  availability: { dayOfWeek: number; slots: { start: string; end: string }[] }[]
) {
  // Supprimer les anciennes disponibilités
  await supabase.from('tutor_availability').delete().eq('tutor_id', tutorId);

  const rows = availability.flatMap((day) =>
    day.slots.map((slot) => ({
      tutor_id: tutorId,
      day_of_week: day.dayOfWeek,
      start_time: slot.start,
      end_time: slot.end,
    }))
  );

  if (rows.length === 0) return;
  const { error } = await supabase.from('tutor_availability').insert(rows);
  if (error) throw error;
}

// ── DEMANDES DE TUTEURS ──────────────────────────────────────

export async function getTutorApplications() {
  const { data, error } = await supabase
    .from('tutor_applications')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updateTutorApplication(id: string, status: 'pending' | 'approved' | 'rejected', notes?: string) {
  const { error } = await supabase
    .from('tutor_applications')
    .update({ status, notes })
    .eq('id', id);
  if (error) throw error;
}
