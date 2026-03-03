// Données mock pour remplacer temporairement la base de données
// L'utilisateur configurera la vraie base de données plus tard

// Types pour les disponibilités
export interface TimeSlot {
  start: string; // Format "HH:mm"
  end: string;   // Format "HH:mm"
}

export interface DayAvailability {
  dayOfWeek: number; // 0 = dimanche, 1 = lundi, etc.
  slots: TimeSlot[];
}

// Type pour les sessions de tutorat
export interface Session {
  id: string;
  studentId: string;
  tutorId: string;
  studentName: string;
  tutorName: string;
  date: string;
  time: string;
  duration: number;
  subject: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'pending';
  notes?: string;
  zoomLink?: string | null;
  tutorComment?: string | null;
}

export const mockTutors = [
  {
    userId: 'tutor-1',
    user: { name: 'Marie Dubois', email: 'marie@example.com' },
    subjects: ['Mathématiques', 'Physique', 'Chimie'],
    levels: ['Secondaire', 'CÉGEP'],
    mode: ['online', 'presentiel'],
    rate: 35,
    bio: 'Tutrice expérimentée en sciences avec 5 ans d\'expérience. Spécialisée dans la préparation aux examens.',
    rating: 4.8,
    reviewCount: 24,
    approved: true,
    availability: [
      { dayOfWeek: 1, slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }] }, // Lundi
      { dayOfWeek: 2, slots: [{ start: '10:00', end: '16:00' }] }, // Mardi
      { dayOfWeek: 3, slots: [{ start: '14:00', end: '20:00' }] }, // Mercredi
      { dayOfWeek: 4, slots: [{ start: '09:00', end: '12:00' }, { start: '16:00', end: '19:00' }] }, // Jeudi
      { dayOfWeek: 5, slots: [{ start: '10:00', end: '17:00' }] }, // Vendredi
    ]
  },
  {
    userId: 'tutor-2',
    user: { name: 'Jean Tremblay', email: 'jean@example.com' },
    subjects: ['Français', 'Littérature', 'Histoire'],
    levels: ['Primaire', 'Secondaire'],
    mode: ['online'],
    rate: 30,
    bio: 'Passionné par l\'enseignement du français et de la littérature. Méthodes pédagogiques adaptées à chaque élève.',
    rating: 4.9,
    reviewCount: 31,
    approved: true,
    availability: [
      { dayOfWeek: 1, slots: [{ start: '13:00', end: '19:00' }] }, // Lundi
      { dayOfWeek: 2, slots: [{ start: '13:00', end: '19:00' }] }, // Mardi
      { dayOfWeek: 3, slots: [{ start: '15:00', end: '21:00' }] }, // Mercredi
      { dayOfWeek: 4, slots: [{ start: '13:00', end: '19:00' }] }, // Jeudi
      { dayOfWeek: 6, slots: [{ start: '09:00', end: '15:00' }] }, // Samedi
    ]
  },
  {
    userId: 'tutor-3',
    user: { name: 'Sophie Martin', email: 'sophie@example.com' },
    subjects: ['Anglais', 'Espagnol'],
    levels: ['Primaire', 'Secondaire', 'CÉGEP'],
    mode: ['online', 'presentiel'],
    rate: 40,
    bio: 'Professeure de langues certifiée. Bilingue français-anglais, avec expérience internationale.',
    rating: 5.0,
    reviewCount: 18,
    approved: true,
    availability: [
      { dayOfWeek: 1, slots: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '17:00' }] }, // Lundi
      { dayOfWeek: 2, slots: [{ start: '08:00', end: '17:00' }] }, // Mardi
      { dayOfWeek: 3, slots: [{ start: '08:00', end: '17:00' }] }, // Mercredi
      { dayOfWeek: 4, slots: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '17:00' }] }, // Jeudi
      { dayOfWeek: 5, slots: [{ start: '08:00', end: '17:00' }] }, // Vendredi
    ]
  },
  {
    userId: 'tutor-4',
    user: { name: 'Thomas Gagnon', email: 'thomas@example.com' },
    subjects: ['Mathématiques', 'Informatique', 'Programmation'],
    levels: ['Secondaire', 'CÉGEP'],
    mode: ['online'],
    rate: 45,
    bio: 'Ingénieur logiciel et tuteur en mathématiques et programmation. Spécialisé en Python et JavaScript.',
    rating: 4.7,
    reviewCount: 15,
    approved: true,
    availability: [
      { dayOfWeek: 1, slots: [{ start: '18:00', end: '22:00' }] }, // Lundi
      { dayOfWeek: 2, slots: [{ start: '18:00', end: '22:00' }] }, // Mardi
      { dayOfWeek: 3, slots: [{ start: '18:00', end: '22:00' }] }, // Mercredi
      { dayOfWeek: 4, slots: [{ start: '18:00', end: '22:00' }] }, // Jeudi
      { dayOfWeek: 6, slots: [{ start: '10:00', end: '18:00' }] }, // Samedi
      { dayOfWeek: 0, slots: [{ start: '10:00', end: '18:00' }] }, // Dimanche
    ]
  }
];

export const mockSessions: Session[] = [
  {
    id: 'session-1',
    studentId: 'student-1',
    tutorId: 'tutor-1',
    studentName: 'Élève Test',
    tutorName: 'Marie Dubois',
    date: new Date('2026-03-05').toISOString(),
    time: '14:00',
    duration: 1.5,
    subject: 'Mathématiques',
    status: 'completed',
    notes: 'Excellente séance ! Travail sur les systèmes d\'équations et les matrices.',
    zoomLink: null,
    tutorComment: 'Excellente séance ! L\'élève a bien compris les concepts d\'algèbre linéaire. Nous avons travaillé sur les systèmes d\'équations et les matrices. La participation était active et les exercices ont été réussis avec brio.',
  },
  {
    id: 'session-2',
    studentId: 'student-1',
    tutorId: 'tutor-2',
    studentName: 'Élève Test',
    tutorName: 'Jean Tremblay',
    date: new Date('2026-03-08').toISOString(),
    time: '10:00',
    duration: 2,
    subject: 'Français',
    status: 'scheduled',
    notes: 'Aide à la rédaction de dissertation',
    zoomLink: 'https://zoom.us/j/9876543210?pwd=xyz789',
    tutorComment: null
  },
  {
    id: 'session-3',
    studentId: 'student-1',
    tutorId: 'tutor-3',
    studentName: 'Élève Test',
    tutorName: 'Sophie Martin',
    date: new Date('2026-02-28').toISOString(),
    time: '16:00',
    duration: 1,
    subject: 'Anglais',
    status: 'completed',
    notes: 'Practice conversation',
    zoomLink: null,
    tutorComment: 'Très bonne séance de conversation! L\'élève gagne en confiance et en fluidité. Nous avons travaillé sur les temps du passé et la prononciation.',
  },
  {
    id: 'session-4',
    studentId: 'student-1',
    tutorId: 'tutor-1',
    studentName: 'Élève Test',
    tutorName: 'Marie Dubois',
    date: new Date('2026-03-12').toISOString(),
    time: '15:00',
    duration: 1,
    subject: 'Physique',
    status: 'pending',
    notes: 'Introduction à la mécanique quantique',
    zoomLink: null,
    tutorComment: null
  },
  // Séances additionnelles pour tester les scénarios de 1ère et 3ème séance
  
  // ÉLÈVE 1: Sophie Lapointe - 2 séances complétées + 1 confirmée (prête pour bilan)
  {
    id: 'session-5',
    studentId: 'student-2',
    tutorId: 'tutor-1',
    studentName: 'Sophie Lapointe',
    tutorName: 'Marie Dubois',
    date: new Date('2026-02-20').toISOString(),
    time: '14:00',
    duration: 1.5,
    subject: 'Mathématiques',
    status: 'completed',
    notes: 'Introduction aux fractions et nombres décimaux',
    zoomLink: null,
    tutorComment: 'Très bonne première séance! L\'élève est attentif et motivé. Bon potentiel en mathématiques.'
  },
  {
    id: 'session-6',
    studentId: 'student-2',
    tutorId: 'tutor-1',
    studentName: 'Sophie Lapointe',
    tutorName: 'Marie Dubois',
    date: new Date('2026-02-25').toISOString(),
    time: '14:00',
    duration: 1.5,
    subject: 'Mathématiques',
    status: 'completed',
    notes: 'Opérations avec les fractions',
    zoomLink: null,
    tutorComment: 'Bonnes améliorations. L\'élève maîtrise maintenant les opérations de base avec les fractions. Continue comme ça!'
  },
  {
    id: 'session-7',
    studentId: 'student-2',
    tutorId: 'tutor-1',
    studentName: 'Sophie Lapointe',
    tutorName: 'Marie Dubois',
    date: new Date('2026-03-03').toISOString(),
    time: '14:00',
    duration: 1.5,
    subject: 'Mathématiques',
    status: 'confirmed',
    notes: '3ème séance - Fractions complexes et pourcentages',
    zoomLink: 'https://zoom.us/j/1234567890?pwd=abc123',
    tutorComment: null
  },
  
  // ÉLÈVE 2: Lucas Gagnon - 2 séances complétées + 1 confirmée (prête pour bilan)
  {
    id: 'session-8',
    studentId: 'student-3',
    tutorId: 'tutor-1',
    studentName: 'Lucas Gagnon',
    tutorName: 'Marie Dubois',
    date: new Date('2026-02-18').toISOString(),
    time: '10:00',
    duration: 2,
    subject: 'Chimie',
    status: 'completed',
    notes: 'Introduction à la chimie organique - Nomenclature',
    zoomLink: null,
    tutorComment: 'Excellente première séance! Lucas comprend rapidement les concepts et pose de bonnes questions. Très engagé.'
  },
  {
    id: 'session-9',
    studentId: 'student-3',
    tutorId: 'tutor-1',
    studentName: 'Lucas Gagnon',
    tutorName: 'Marie Dubois',
    date: new Date('2026-02-23').toISOString(),
    time: '10:00',
    duration: 2,
    subject: 'Chimie',
    status: 'completed',
    notes: 'Groupes fonctionnels et réactions',
    zoomLink: null,
    tutorComment: 'Progrès remarquables! Les exercices de nomenclature sont maintenant bien maîtrisés.'
  },
  {
    id: 'session-10',
    studentId: 'student-3',
    tutorId: 'tutor-1',
    studentName: 'Lucas Gagnon',
    tutorName: 'Marie Dubois',
    date: new Date('2026-03-06').toISOString(),
    time: '10:00',
    duration: 2,
    subject: 'Chimie',
    status: 'confirmed',
    notes: '3ème séance - Mécanismes réactionnels',
    zoomLink: 'https://zoom.us/j/1111222233?pwd=xyz456',
    tutorComment: null
  },
  
  // ÉLÈVE 3: Emma Tremblay - 2 séances complétées + 1 confirmée (prête pour bilan)
  {
    id: 'session-11',
    studentId: 'student-4',
    tutorId: 'tutor-1',
    studentName: 'Emma Tremblay',
    tutorName: 'Marie Dubois',
    date: new Date('2026-02-19').toISOString(),
    time: '16:00',
    duration: 1.5,
    subject: 'Physique',
    status: 'completed',
    notes: 'Cinématique - Mouvement rectiligne uniforme',
    zoomLink: null,
    tutorComment: 'Première séance très productive! Emma a une excellente compréhension des concepts de base.'
  },
  {
    id: 'session-12',
    studentId: 'student-4',
    tutorId: 'tutor-1',
    studentName: 'Emma Tremblay',
    tutorName: 'Marie Dubois',
    date: new Date('2026-02-26').toISOString(),
    time: '16:00',
    duration: 1.5,
    subject: 'Physique',
    status: 'completed',
    notes: 'Mouvement rectiligne uniformément accéléré',
    zoomLink: null,
    tutorComment: 'Bonne progression! Les graphiques position-temps et vitesse-temps sont bien compris.'
  },
  {
    id: 'session-13',
    studentId: 'student-4',
    tutorId: 'tutor-1',
    studentName: 'Emma Tremblay',
    tutorName: 'Marie Dubois',
    date: new Date('2026-03-04').toISOString(),
    time: '16:00',
    duration: 1.5,
    subject: 'Physique',
    status: 'confirmed',
    notes: '3ème séance - Forces et lois de Newton',
    zoomLink: 'https://zoom.us/j/3333444455?pwd=def789',
    tutorComment: null
  }
];

export const mockMessages = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'tutor-1',
    senderName: 'Marie Dubois',
    receiverId: 'student-1',
    recipientId: 'student-1',
    content: 'Bonjour! J\'ai bien reçu votre demande de cours. Je suis disponible jeudi après-midi.',
    timestamp: new Date('2026-03-01T10:30:00').toISOString(),
    createdAt: new Date('2026-03-01T10:30:00').toISOString(),
    read: true
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    senderId: 'student-1',
    senderName: 'Élève Test',
    receiverId: 'tutor-1',
    recipientId: 'tutor-1',
    content: 'Parfait! 14h jeudi vous convient?',
    timestamp: new Date('2026-03-01T11:00:00').toISOString(),
    createdAt: new Date('2026-03-01T11:00:00').toISOString(),
    read: true
  },
  {
    id: 'msg-3',
    conversationId: 'conv-1',
    senderId: 'tutor-1',
    senderName: 'Marie Dubois',
    receiverId: 'student-1',
    recipientId: 'student-1',
    content: 'Oui, c\'est parfait. À jeudi!',
    timestamp: new Date('2026-03-01T11:15:00').toISOString(),
    createdAt: new Date('2026-03-01T11:15:00').toISOString(),
    read: false
  }
];

export const mockPayments = [
  {
    id: 'payment-1',
    studentId: 'student-1',
    sessionId: 'session-3',
    amount: 40,
    status: 'completed',
    date: new Date('2026-02-28T17:00:00').toISOString(),
    tutorName: 'Sophie Martin',
    tutorId: 'tutor-3',
    studentName: 'Élève Test',
    subject: 'Anglais',
    duration: 1,
    rate: 40,
    method: 'Carte de crédit',
    invoiceId: 'INV-2026-002'
  },
  {
    id: 'payment-2',
    studentId: 'student-1',
    sessionId: 'session-1',
    amount: 52.50,
    status: 'completed',
    date: new Date('2026-02-25T14:00:00').toISOString(),
    tutorName: 'Marie Dubois',
    tutorId: 'tutor-1',
    studentName: 'Élève Test',
    subject: 'Mathématiques',
    duration: 1.5,
    rate: 35,
    method: 'Interac',
    invoiceId: 'INV-2026-001'
  },
  {
    id: 'payment-3',
    studentId: 'student-2',
    sessionId: 'session-5',
    amount: 52.50,
    status: 'completed',
    date: new Date('2026-02-20T14:00:00').toISOString(),
    tutorName: 'Marie Dubois',
    tutorId: 'tutor-1',
    studentName: 'Sophie Lapointe',
    subject: 'Mathématiques',
    duration: 1.5,
    rate: 35,
    method: 'Carte de crédit',
    invoiceId: 'INV-2026-003'
  },
  {
    id: 'payment-4',
    studentId: 'student-2',
    sessionId: 'session-6',
    amount: 52.50,
    status: 'completed',
    date: new Date('2026-02-25T14:00:00').toISOString(),
    tutorName: 'Marie Dubois',
    tutorId: 'tutor-1',
    studentName: 'Sophie Lapointe',
    subject: 'Mathématiques',
    duration: 1.5,
    rate: 35,
    method: 'Interac',
    invoiceId: 'INV-2026-004'
  }
];

export const mockInvoices = [
  {
    id: 'invoice-1',
    invoiceId: 'INV-2026-001',
    studentId: 'student-1',
    invoiceDate: new Date('2026-02-25').toISOString(),
    dueDate: new Date('2026-03-11').toISOString(),
    paymentStatus: 'Payé' as const,
    clientName: 'Parent Test',
    clientEmail: 'parent.test@example.com',
    studentName: 'Élève Test',
    lineItems: [
      {
        date: new Date('2026-02-25T14:00:00').toISOString(),
        studentName: 'Élève Test',
        subject: 'Mathématiques',
        durationHours: 1.5,
        rate: 35,
        total: 52.50
      }
    ],
    subtotal: 52.50,
    discountAmount: 0,
    taxAmountGST: 0, // Pas de taxes sur les services de tutorat au Québec
    taxAmountQST: 0,
    totalDue: 52.50,
    paymentLinkUrl: null
  },
  {
    id: 'invoice-2',
    invoiceId: 'INV-2026-002',
    studentId: 'student-1',
    invoiceDate: new Date('2026-02-28').toISOString(),
    dueDate: new Date('2026-03-14').toISOString(),
    paymentStatus: 'Payé' as const,
    clientName: 'Parent Test',
    clientEmail: 'parent.test@example.com',
    studentName: 'Élève Test',
    lineItems: [
      {
        date: new Date('2026-02-28T16:00:00').toISOString(),
        studentName: 'Élève Test',
        subject: 'Anglais',
        durationHours: 1,
        rate: 40,
        total: 40
      }
    ],
    subtotal: 40,
    discountAmount: 0,
    taxAmountGST: 0,
    taxAmountQST: 0,
    totalDue: 40,
    paymentLinkUrl: null
  },
  {
    id: 'invoice-3',
    invoiceId: 'INV-2026-003',
    studentId: 'student-2',
    invoiceDate: new Date('2026-02-20').toISOString(),
    dueDate: new Date('2026-03-06').toISOString(),
    paymentStatus: 'Payé' as const,
    clientName: 'M. Lapointe',
    clientEmail: 'lapointe@example.com',
    studentName: 'Sophie Lapointe',
    lineItems: [
      {
        date: new Date('2026-02-20T14:00:00').toISOString(),
        studentName: 'Sophie Lapointe',
        subject: 'Mathématiques',
        durationHours: 1.5,
        rate: 35,
        total: 52.50
      }
    ],
    subtotal: 52.50,
    discountAmount: 0,
    taxAmountGST: 0,
    taxAmountQST: 0,
    totalDue: 52.50,
    paymentLinkUrl: null
  },
  {
    id: 'invoice-4',
    invoiceId: 'INV-2026-004',
    studentId: 'student-2',
    invoiceDate: new Date('2026-02-25').toISOString(),
    dueDate: new Date('2026-03-11').toISOString(),
    paymentStatus: 'À payer' as const,
    clientName: 'M. Lapointe',
    clientEmail: 'lapointe@example.com',
    studentName: 'Sophie Lapointe',
    lineItems: [
      {
        date: new Date('2026-02-25T14:00:00').toISOString(),
        studentName: 'Sophie Lapointe',
        subject: 'Mathématiques',
        durationHours: 1.5,
        rate: 35,
        total: 52.50
      }
    ],
    subtotal: 52.50,
    discountAmount: 0,
    taxAmountGST: 0,
    taxAmountQST: 0,
    totalDue: 52.50,
    paymentLinkUrl: 'https://pay.tutosucces.com/invoice-4'
  },
  {
    id: 'invoice-5',
    invoiceId: 'INV-2026-005',
    studentId: 'student-3',
    invoiceDate: new Date('2026-02-18').toISOString(),
    dueDate: new Date('2026-03-04').toISOString(),
    paymentStatus: 'Payé' as const,
    clientName: 'Mme Gagnon',
    clientEmail: 'gagnon@example.com',
    studentName: 'Lucas Gagnon',
    lineItems: [
      {
        date: new Date('2026-02-18T10:00:00').toISOString(),
        studentName: 'Lucas Gagnon',
        subject: 'Chimie',
        durationHours: 2,
        rate: 35,
        total: 70
      }
    ],
    subtotal: 70,
    discountAmount: 0,
    taxAmountGST: 0,
    taxAmountQST: 0,
    totalDue: 70,
    paymentLinkUrl: null
  }
];

// Fonction utilitaire pour simuler un délai réseau
export const simulateNetworkDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Fonction pour obtenir les tuteurs
export const getMockTutors = async () => {
  await simulateNetworkDelay();
  return mockTutors;
};

// Fonction pour obtenir les séances d'un utilisateur
export const getMockSessions = async (userId?: string, role?: 'student' | 'tutor') => {
  await simulateNetworkDelay();
  
  // Vérifier si des sessions sont stockées dans localStorage
  const storedSessions = localStorage.getItem('mockSessions');
  let allSessions = mockSessions;
  
  if (storedSessions) {
    try {
      allSessions = JSON.parse(storedSessions);
    } catch (error) {
      console.error('Error parsing stored sessions:', error);
    }
  } else {
    // Si pas de données en localStorage, initialiser avec les données mock
    localStorage.setItem('mockSessions', JSON.stringify(mockSessions));
  }
  
  // Si aucun filtre n'est fourni, retourner toutes les sessions
  if (!userId || !role) {
    return allSessions;
  }
  
  // Sinon, filtrer par utilisateur et rôle
  return allSessions.filter((session: any) => {
    if (role === 'student') {
      return session.studentId === userId;
    } else if (role === 'tutor') {
      return session.tutorId === userId;
    }
    return false;
  });
};

// Fonction pour obtenir les messages
export const getMockMessages = async (userId: string) => {
  await simulateNetworkDelay();
  return mockMessages;
};

// Fonction pour obtenir les paiements
export const getMockPayments = async (userId: string) => {
  await simulateNetworkDelay();
  return mockPayments;
};

// Fonction pour obtenir les factures
export const getMockInvoices = async (userId: string) => {
  await simulateNetworkDelay();
  return mockInvoices;
};

// Fonction pour vérifier si un tuteur est disponible à une date/heure donnée
export const isTutorAvailable = (tutor: any, requestedDateTime: Date, durationHours: number): boolean => {
  if (!tutor.availability || tutor.availability.length === 0) {
    return true; // Si pas de disponibilités définies, considérer comme disponible
  }

  const dayOfWeek = requestedDateTime.getDay();
  const requestedMinutes = requestedDateTime.getHours() * 60 + requestedDateTime.getMinutes();
  const endMinutes = requestedMinutes + (durationHours * 60);

  // Trouver les disponibilités pour ce jour
  const dayAvailability = tutor.availability.find((avail: DayAvailability) => avail.dayOfWeek === dayOfWeek);
  
  if (!dayAvailability) {
    return false; // Pas disponible ce jour-là
  }

  // Vérifier si l'une des plages horaires peut accueillir la session complète
  return dayAvailability.slots.some((slot: TimeSlot) => {
    const [startHour, startMin] = slot.start.split(':').map(Number);
    const [endHour, endMin] = slot.end.split(':').map(Number);
    const slotStartMinutes = startHour * 60 + startMin;
    const slotEndMinutes = endHour * 60 + endMin;

    return requestedMinutes >= slotStartMinutes && endMinutes <= slotEndMinutes;
  });
};

// Fonction pour obtenir toutes les matières disponibles
export const getAllSubjects = (): string[] => {
  const subjectsSet = new Set<string>();
  mockTutors.forEach(tutor => {
    tutor.subjects.forEach((subject: string) => subjectsSet.add(subject));
  });
  return Array.from(subjectsSet).sort();
};

// Fonction pour obtenir le profil d'un utilisateur
export const getMockUserProfile = async (userId: string) => {
  await simulateNetworkDelay();
  
  // Retourner un profil utilisateur mock
  if (userId === 'admin-1') {
    return {
      id: userId,
      name: 'Administrateur',
      email: 'admin@tutosucces.com',
      phone: '(514) 000-0000',
      role: 'admin',
      createdAt: new Date('2025-01-01').toISOString()
    };
  }
  
  return {
    id: userId,
    name: userId.startsWith('student') ? 'Élève Test' : 'Tuteur Test',
    email: userId.startsWith('student') ? 'eleve.test@example.com' : 'tuteur.test@example.com',
    phone: '(514) 123-4567',
    role: userId.startsWith('student') ? 'student' : userId.startsWith('tutor') ? 'tutor' : 'admin',
    createdAt: new Date('2025-01-15').toISOString()
  };
};

// Fonction pour obtenir tous les utilisateurs (pour l'admin)
export const getMockUsers = async () => {
  await simulateNetworkDelay();
  
  return [
    {
      id: 'student-1',
      name: 'Élève Test',
      email: 'eleve.test@example.com',
      phone: '(514) 123-4567',
      role: 'student',
      created_at: new Date('2025-01-15').toISOString()
    },
    {
      id: 'student-2',
      name: 'Sophie Lapointe',
      email: 'sophie.lapointe@example.com',
      phone: '(438) 555-1111',
      role: 'student',
      created_at: new Date('2025-02-01').toISOString()
    },
    {
      id: 'student-3',
      name: 'Lucas Gagnon',
      email: 'lucas.gagnon@example.com',
      phone: '(450) 555-2222',
      role: 'student',
      created_at: new Date('2025-02-10').toISOString()
    },
    {
      id: 'student-4',
      name: 'Emma Tremblay',
      email: 'emma.tremblay@example.com',
      phone: '(514) 555-3333',
      role: 'student',
      created_at: new Date('2025-02-15').toISOString()
    },
    {
      id: 'tutor-1',
      name: 'Marie Dubois',
      email: 'marie@example.com',
      phone: '(514) 555-3333',
      role: 'tutor',
      subjects: ['Mathématiques', 'Physique', 'Chimie'],
      created_at: new Date('2024-12-01').toISOString()
    },
    {
      id: 'tutor-2',
      name: 'Jean Tremblay',
      email: 'jean@example.com',
      phone: '(438) 555-4444',
      role: 'tutor',
      subjects: ['Français', 'Littérature', 'Histoire'],
      created_at: new Date('2024-12-15').toISOString()
    },
    {
      id: 'tutor-3',
      name: 'Sophie Martin',
      email: 'sophie@example.com',
      phone: '(450) 555-5555',
      role: 'tutor',
      subjects: ['Anglais', 'Espagnol'],
      created_at: new Date('2025-01-01').toISOString()
    },
    {
      id: 'tutor-4',
      name: 'Thomas Gagnon',
      email: 'thomas@example.com',
      phone: '(514) 555-6666',
      role: 'tutor',
      subjects: ['Mathématiques', 'Informatique', 'Programmation'],
      created_at: new Date('2025-01-10').toISOString()
    },
    {
      id: 'admin-1',
      name: 'Administrateur',
      email: 'admin@tutosucces.com',
      phone: '(514) 000-0000',
      role: 'admin',
      created_at: new Date('2024-01-01').toISOString()
    }
  ];
};

// Fonction pour réinitialiser les données mock dans localStorage
export const resetMockData = () => {
  localStorage.removeItem('mockSessions');
  console.log('Données mock réinitialisées');
};

// Données mock pour les relevés de paie des tuteurs
export const mockPayrollRecords = [
  {
    id: 'PAY-2026-03-W1',
    tutorId: 'tutor-1',
    periodStart: new Date('2026-03-03').toISOString(),
    periodEnd: new Date('2026-03-09').toISOString(),
    status: 'current', // current, pending, paid
    totalHours: 4.5,
    totalAmount: 157.50,
    sessions: [
      {
        date: new Date('2026-03-05T14:00:00').toISOString(),
        studentName: 'Élève Test',
        subject: 'Mathématiques',
        duration: 1.5,
        rate: 35,
        amount: 52.50
      },
      {
        date: new Date('2026-03-06T10:00:00').toISOString(),
        studentName: 'Sophie Lavoie',
        subject: 'Chimie',
        duration: 2,
        rate: 35,
        amount: 70
      },
      {
        date: new Date('2026-03-08T15:00:00').toISOString(),
        studentName: 'Marc Gagnon',
        subject: 'Physique',
        duration: 1,
        rate: 35,
        amount: 35
      }
    ],
    paymentDate: null
  },
  {
    id: 'PAY-2026-02-W4',
    tutorId: 'tutor-1',
    periodStart: new Date('2026-02-24').toISOString(),
    periodEnd: new Date('2026-03-02').toISOString(),
    status: 'pending',
    totalHours: 6,
    totalAmount: 210,
    sessions: [
      {
        date: new Date('2026-02-25T14:00:00').toISOString(),
        studentName: 'Élève Test',
        subject: 'Mathématiques',
        duration: 1.5,
        rate: 35,
        amount: 52.50
      },
      {
        date: new Date('2026-02-26T16:00:00').toISOString(),
        studentName: 'Julie Martin',
        subject: 'Mathématiques',
        duration: 1.5,
        rate: 35,
        amount: 52.50
      },
      {
        date: new Date('2026-02-28T16:00:00').toISOString(),
        studentName: 'Élève Test',
        subject: 'Anglais',
        duration: 1,
        rate: 35,
        amount: 35
      },
      {
        date: new Date('2026-03-01T10:00:00').toISOString(),
        studentName: 'Pierre Dubois',
        subject: 'Physique',
        duration: 2,
        rate: 35,
        amount: 70
      }
    ],
    paymentDate: null
  },
  {
    id: 'PAY-2026-02-W3',
    tutorId: 'tutor-1',
    periodStart: new Date('2026-02-17').toISOString(),
    periodEnd: new Date('2026-02-23').toISOString(),
    status: 'paid',
    totalHours: 7.5,
    totalAmount: 262.50,
    sessions: [
      {
        date: new Date('2026-02-18T14:00:00').toISOString(),
        studentName: 'Élève Test',
        subject: 'Mathématiques',
        duration: 1.5,
        rate: 35,
        amount: 52.50
      },
      {
        date: new Date('2026-02-19T15:00:00').toISOString(),
        studentName: 'Sophie Lavoie',
        subject: 'Chimie',
        duration: 2,
        rate: 35,
        amount: 70
      },
      {
        date: new Date('2026-02-20T14:00:00').toISOString(),
        studentName: 'Jean Tremblay',
        subject: 'Mathématiques',
        duration: 1.5,
        rate: 35,
        amount: 52.50
      },
      {
        date: new Date('2026-02-21T10:00:00').toISOString(),
        studentName: 'Marc Gagnon',
        subject: 'Physique',
        duration: 1,
        rate: 35,
        amount: 35
      },
      {
        date: new Date('2026-02-22T16:00:00').toISOString(),
        studentName: 'Julie Martin',
        subject: 'Mathématiques',
        duration: 1.5,
        rate: 35,
        amount: 52.50
      }
    ],
    paymentDate: new Date('2026-02-28').toISOString()
  },
  {
    id: 'PAY-2026-02-W2',
    tutorId: 'tutor-1',
    periodStart: new Date('2026-02-10').toISOString(),
    periodEnd: new Date('2026-02-16').toISOString(),
    status: 'paid',
    totalHours: 8,
    totalAmount: 280,
    sessions: [
      {
        date: new Date('2026-02-11T14:00:00').toISOString(),
        studentName: 'Élève Test',
        subject: 'Mathématiques',
        duration: 1.5,
        rate: 35,
        amount: 52.50
      },
      {
        date: new Date('2026-02-12T10:00:00').toISOString(),
        studentName: 'Pierre Dubois',
        subject: 'Physique',
        duration: 2,
        rate: 35,
        amount: 70
      },
      {
        date: new Date('2026-02-13T16:00:00').toISOString(),
        studentName: 'Sophie Lavoie',
        subject: 'Chimie',
        duration: 2,
        rate: 35,
        amount: 70
      },
      {
        date: new Date('2026-02-14T15:00:00').toISOString(),
        studentName: 'Marc Gagnon',
        subject: 'Physique',
        duration: 1,
        rate: 35,
        amount: 35
      },
      {
        date: new Date('2026-02-15T14:00:00').toISOString(),
        studentName: 'Julie Martin',
        subject: 'Mathématiques',
        duration: 1.5,
        rate: 35,
        amount: 52.50
      }
    ],
    paymentDate: new Date('2026-02-21').toISOString()
  },
  {
    id: 'PAY-2026-02-W1',
    tutorId: 'tutor-1',
    periodStart: new Date('2026-02-03').toISOString(),
    periodEnd: new Date('2026-02-09').toISOString(),
    status: 'paid',
    totalHours: 5.5,
    totalAmount: 192.50,
    sessions: [
      {
        date: new Date('2026-02-04T14:00:00').toISOString(),
        studentName: 'Élève Test',
        subject: 'Mathématiques',
        duration: 1.5,
        rate: 35,
        amount: 52.50
      },
      {
        date: new Date('2026-02-05T10:00:00').toISOString(),
        studentName: 'Sophie Lavoie',
        subject: 'Chimie',
        duration: 2,
        rate: 35,
        amount: 70
      },
      {
        date: new Date('2026-02-07T16:00:00').toISOString(),
        studentName: 'Pierre Dubois',
        subject: 'Physique',
        duration: 2,
        rate: 35,
        amount: 70
      }
    ],
    paymentDate: new Date('2026-02-14').toISOString()
  }
];

// Fonction pour obtenir les relevés de paie d'un tuteur
export const getMockPayrollRecords = async (tutorId: string) => {
  await simulateNetworkDelay();
  return mockPayrollRecords.filter(record => record.tutorId === tutorId);
};

// Fonction pour obtenir le profil d'un tuteur
export const getMockTutorProfile = async (tutorId: string) => {
  await simulateNetworkDelay();
  return {
    id: tutorId,
    name: 'Tuteur Test',
    rating: 4.8,
    reviewCount: 12,
    active: true,
    subjects: ['Mathématiques', 'Physique', 'Chimie'],
    hourlyRate: 35
  };
};