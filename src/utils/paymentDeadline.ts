export type PaymentDeadlineStatus = 'pending' | 'due_today' | 'late' | 'paid';

export function addCalendarDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function normalizeDateOnly(dateValue: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return new Date(`${dateValue}T12:00:00`);
  }

  return new Date(dateValue);
}

export function getPaymentDeadlineInfo(sessionDate: string | null, paymentStatus?: string | null) {
  if (paymentStatus === 'paid') {
    return {
      status: 'paid' as PaymentDeadlineStatus,
      label: 'Payé',
      dueDate: null,
      daysLeft: null,
    };
  }

  if (!sessionDate) {
    return {
      status: 'pending' as PaymentDeadlineStatus,
      label: 'À payer',
      dueDate: null,
      daysLeft: null,
    };
  }

  const baseDate = normalizeDateOnly(sessionDate);
  baseDate.setHours(0, 0, 0, 0);

  const dueDate = addCalendarDays(baseDate, 5);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return {
      status: 'late' as PaymentDeadlineStatus,
      label: `En retard (${Math.abs(daysLeft)}j)`,
      dueDate,
      daysLeft,
    };
  }

  if (daysLeft === 0) {
    return {
      status: 'due_today' as PaymentDeadlineStatus,
      label: "À payer aujourd'hui",
      dueDate,
      daysLeft,
    };
  }

  return {
    status: 'pending' as PaymentDeadlineStatus,
    label: `${daysLeft}j restant${daysLeft > 1 ? 's' : ''}`,
    dueDate,
    daysLeft,
  };
}
