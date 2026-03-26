import { supabase } from '../app/core/supabase.client';
import { addCalendarDays } from './paymentDeadline';

export interface InvoiceLineItem {
  sessionId?: string;
  date: string;
  studentName: string;
  subject: string;
  durationHours: number;
  rate: number;
  total: number;
}

export interface SiteInvoice {
  id: string;
  invoiceId: string;
  studentId: string;
  clientName: string;
  clientEmail: string;
  studentName: string;
  invoiceDate: string;
  dueDate: string;
  paymentStatus: 'À payer' | 'Partiellement payé' | 'Payé' | 'En retard';
  subtotal: number;
  discountAmount: number;
  taxAmountGST: number;
  taxAmountQST: number;
  totalDue: number;
  lineItems: InvoiceLineItem[];
  paymentLinkUrl: string | null;
}

function mapInvoice(row: any): SiteInvoice {
  const rawStatus = row.payment_status;
  const dueDate = row.due_date;
  const derivedStatus =
    rawStatus !== 'Payé' && dueDate && new Date(dueDate) < new Date()
      ? 'En retard'
      : rawStatus;

  return {
    id: row.id,
    invoiceId: row.invoice_id,
    studentId: row.student_id,
    clientName: row.client_name,
    clientEmail: row.client_email,
    studentName: row.student_name,
    invoiceDate: row.invoice_date,
    dueDate,
    paymentStatus: derivedStatus,
    subtotal: Number(row.subtotal ?? 0),
    discountAmount: Number(row.discount_amount ?? 0),
    taxAmountGST: Number(row.tax_amount_gst ?? 0),
    taxAmountQST: Number(row.tax_amount_qst ?? 0),
    totalDue: Number(row.total_due ?? 0),
    lineItems: row.line_items ?? [],
    paymentLinkUrl: row.payment_link_url ?? null,
  };
}

function buildInvoiceId(sessionId: string, completedAt: string | null) {
  const date = new Date(completedAt || new Date().toISOString());
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `TS-${year}${month}${day}-${String(sessionId).slice(0, 8).toUpperCase()}`;
}

function buildPaymentId(sessionId: string) {
  return `PAY-${String(sessionId).slice(0, 8).toUpperCase()}`;
}

export async function fetchStudentInvoices(studentId: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('student_id', studentId)
    .order('invoice_date', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapInvoice);
}

export async function fetchInvoicesByIds(invoiceIds: string[]) {
  if (invoiceIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .in('invoice_id', invoiceIds);

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapInvoice);
}

export async function ensureInvoiceForCompletedSession(session: {
  id: string;
  student_id: string;
  tutor_id: string;
  subject: string;
  session_date: string;
  duration_minutes: number;
  total_price: number;
  completed_at: string | null;
}) {
  const { data: existingPayment } = await supabase
    .from('payments')
    .select('invoice_id')
    .eq('session_id', session.id)
    .maybeSingle();

  if (existingPayment?.invoice_id) {
    return existingPayment.invoice_id as string;
  }

  const { data: studentProfile, error: studentError } = await supabase
    .from('profiles')
    .select('id, name, email')
    .eq('id', session.student_id)
    .single();

  if (studentError) {
    throw studentError;
  }

  const { data: tutorProfile } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('id', session.tutor_id)
    .single();

  const invoiceId = buildInvoiceId(session.id, session.completed_at);
  const completedAt = session.completed_at || new Date().toISOString();
  const dueDate = addCalendarDays(new Date(`${session.session_date}T12:00:00`), 5).toISOString();
  const durationHours = Number(((session.duration_minutes || 0) / 60).toFixed(2));
  const rate = durationHours > 0 ? Number((session.total_price / durationHours).toFixed(2)) : Number(session.total_price);
  const lineItems = [{
    sessionId: session.id,
    date: session.session_date,
    studentName: studentProfile.name || 'Élève',
    subject: session.subject,
    durationHours,
    rate,
    total: Number(session.total_price),
    tutorName: tutorProfile?.name || 'Tuteur',
  }];

  const invoicePayload = {
    invoice_id: invoiceId,
    student_id: session.student_id,
    client_name: studentProfile.name || 'Parent',
    client_email: studentProfile.email || '',
    student_name: studentProfile.name || 'Élève',
    invoice_date: completedAt,
    due_date: dueDate,
    payment_status: 'À payer',
    subtotal: Number(session.total_price),
    discount_amount: 0,
    tax_amount_gst: 0,
    tax_amount_qst: 0,
    total_due: Number(session.total_price),
    line_items: lineItems,
    payment_link_url: null,
  };

  const { error: invoiceError } = await supabase
    .from('invoices')
    .insert(invoicePayload);

  if (invoiceError) {
    throw invoiceError;
  }

  const paymentPayload = {
    payment_id: buildPaymentId(session.id),
    session_id: session.id,
    student_id: session.student_id,
    tutor_id: session.tutor_id,
    invoice_id: invoiceId,
    amount: session.total_price,
    status: 'pending',
    payment_date: completedAt,
    method: null,
    tutor_name: tutorProfile?.name || 'Tuteur',
    student_name: studentProfile.name || 'Élève',
    subject: session.subject,
    duration: durationHours,
    rate,
  };

  const { data: paymentRow } = await supabase
    .from('payments')
    .select('session_id')
    .eq('session_id', session.id)
    .maybeSingle();

  const { error: paymentError } = paymentRow?.session_id
    ? await supabase
        .from('payments')
        .update(paymentPayload)
        .eq('session_id', session.id)
    : await supabase
        .from('payments')
        .insert(paymentPayload);

  if (paymentError) {
    throw paymentError;
  }

  return invoiceId;
}

export async function markInvoicePaidForSession(sessionId: string, method: string, paidAt: string) {
  const { data: paymentRow, error: paymentError } = await supabase
    .from('payments')
    .select('invoice_id')
    .eq('session_id', sessionId)
    .maybeSingle();

  if (paymentError) {
    throw paymentError;
  }

  if (paymentRow?.invoice_id) {
    const { error: invoiceError } = await supabase
      .from('invoices')
      .update({
        payment_status: 'Payé',
        payment_link_url: null,
      })
      .eq('invoice_id', paymentRow.invoice_id);

    if (invoiceError) {
      throw invoiceError;
    }
  }

  const { error: updatePaymentError } = await supabase
    .from('payments')
    .update({
      status: 'completed',
      payment_date: paidAt,
      method,
    })
    .eq('session_id', sessionId);

  if (updatePaymentError) {
    throw updatePaymentError;
  }
}

export async function fetchInvoiceBySessionId(sessionId: string) {
  const { data: paymentRow, error: paymentError } = await supabase
    .from('payments')
    .select('invoice_id')
    .eq('session_id', sessionId)
    .maybeSingle();

  if (paymentError) {
    throw paymentError;
  }

  if (!paymentRow?.invoice_id) {
    return null;
  }

  const { data: invoiceRow, error: invoiceError } = await supabase
    .from('invoices')
    .select('*')
    .eq('invoice_id', paymentRow.invoice_id)
    .single();

  if (invoiceError) {
    throw invoiceError;
  }

  return mapInvoice(invoiceRow);
}
