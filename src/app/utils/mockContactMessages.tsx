// Messages de contact simulés pour l'admin

export const mockContactMessages = [
  {
    id: 'contact-1',
    firstName: 'Marie',
    lastName: 'Lapointe',
    email: 'marie.lapointe@gmail.com',
    phone: '514-555-1234',
    requestType: 'student',
    schoolLevel: 'Secondaire',
    subjects: ['Mathématiques', 'Chimie'],
    preferredSchedule: 'Mardis et jeudis soirs, 18h-20h',
    hoursPerWeek: '3 heures',
    message: 'Bonjour, je cherche un tuteur pour mon fils de secondaire 4. Il a de la difficulté en mathématiques et chimie. Il prépare ses examens de fin d\'année et aurait besoin d\'un soutien régulier.',
    submittedAt: new Date('2026-03-01T14:30:00').toISOString(),
    read: false,
    status: 'pending' // pending, contacted, account_created
  },
  {
    id: 'contact-2',
    firstName: 'Jean',
    lastName: 'Tremblay',
    email: 'j.tremblay@hotmail.com',
    phone: '438-555-7890',
    requestType: 'student',
    schoolLevel: 'CÉGEP',
    subjects: ['Calcul I', 'Algèbre linéaire'],
    preferredSchedule: 'Weekends, flexibles',
    hoursPerWeek: '4-5 heures',
    message: 'Salut! Je suis en première année de cégep en sciences de la nature. J\'ai vraiment besoin d\'aide en calcul et algèbre linéaire. Je suis disponible surtout la fin de semaine. Merci!',
    submittedAt: new Date('2026-03-02T09:15:00').toISOString(),
    read: false,
    status: 'pending'
  },
  {
    id: 'contact-3',
    firstName: 'Sophie',
    lastName: 'Gagnon',
    email: 'sophie.gagnon@gmail.com',
    phone: '450-555-3456',
    requestType: 'student',
    schoolLevel: 'Primaire',
    subjects: ['Français', 'Mathématiques'],
    preferredSchedule: 'Après l\'école, 16h-18h',
    hoursPerWeek: '2 heures',
    message: 'Ma fille est en 5e année et elle a besoin d\'aide en français et mathématiques. Elle manque de confiance et aurait besoin d\'un tuteur patient qui peut l\'encourager.',
    submittedAt: new Date('2026-03-02T16:45:00').toISOString(),
    read: true,
    status: 'contacted'
  },
  {
    id: 'contact-4',
    firstName: 'David',
    lastName: 'Chen',
    email: 'david.chen88@gmail.com',
    phone: '514-555-9012',
    requestType: 'tutor',
    schoolLevel: '',
    subjects: ['Mathématiques', 'Physique', 'Chimie'],
    preferredSchedule: '',
    hoursPerWeek: '',
    message: 'Bonjour, je suis étudiant en génie à Polytechnique et j\'aimerais devenir tuteur en mathématiques, physique et chimie. J\'ai 3 ans d\'expérience en tutorat privé et je suis très passionné par l\'enseignement. Disponible soirs et weekends.',
    submittedAt: new Date('2026-02-28T11:20:00').toISOString(),
    read: true,
    status: 'contacted'
  },
  {
    id: 'contact-5',
    firstName: 'Isabelle',
    lastName: 'Roy',
    email: 'isabelle.roy@outlook.com',
    phone: '514-555-6789',
    requestType: 'student',
    schoolLevel: 'Secondaire',
    subjects: ['Anglais'],
    preferredSchedule: 'Mercredis après-midi',
    hoursPerWeek: '2 heures',
    message: 'Mon fils doit améliorer son anglais pour son secondaire 5. Nous cherchons quelqu\'un de bilingue qui peut l\'aider avec la conversation et la compréhension écrite.',
    submittedAt: new Date('2026-03-03T08:00:00').toISOString(),
    read: false,
    status: 'pending'
  },
  {
    id: 'contact-6',
    firstName: 'Alexandre',
    lastName: 'Dubois',
    email: 'alex.dubois@gmail.com',
    phone: '438-555-2345',
    requestType: 'student',
    schoolLevel: 'CÉGEP',
    subjects: ['Chimie organique', 'Chimie générale'],
    preferredSchedule: 'Soirs de semaine',
    hoursPerWeek: '3 heures',
    message: 'Je suis en sciences de la santé au cégep et la chimie organique me pose vraiment problème. J\'ai un examen dans 3 semaines et j\'aurais besoin d\'aide intensive. Prêt à payer un bon taux pour quelqu\'un d\'expérimenté.',
    submittedAt: new Date('2026-03-03T12:30:00').toISOString(),
    read: false,
    status: 'pending'
  },
  {
    id: 'contact-7',
    firstName: 'Caroline',
    lastName: 'Lefebvre',
    email: 'c.lefebvre@yahoo.ca',
    phone: '450-555-8901',
    requestType: 'tutor',
    schoolLevel: '',
    subjects: ['Français', 'Anglais'],
    preferredSchedule: '',
    hoursPerWeek: '',
    message: 'Enseignante à la retraite avec 25 ans d\'expérience en français et anglais. J\'aimerais offrir mes services de tutorat en ligne. Disponible tous les jours.',
    submittedAt: new Date('2026-02-29T15:45:00').toISOString(),
    read: true,
    status: 'account_created'
  },
  {
    id: 'contact-8',
    firstName: 'Marc',
    lastName: 'Bouchard',
    email: 'marc.bouchard@gmail.com',
    phone: '514-555-4567',
    requestType: 'student',
    schoolLevel: 'Primaire',
    subjects: ['Mathématiques'],
    preferredSchedule: 'Lundis et vendredis, 17h',
    hoursPerWeek: '2 heures',
    message: 'Mon garçon de 4e année a besoin d\'aide en mathématiques. Il est très actif et a besoin d\'un tuteur dynamique qui peut le garder motivé.',
    submittedAt: new Date('2026-03-01T19:00:00').toISOString(),
    read: true,
    status: 'contacted'
  },
  {
    id: 'contact-9',
    firstName: 'Julie',
    lastName: 'Martin',
    email: 'julie.martin@hotmail.com',
    phone: '438-555-1111',
    requestType: 'info',
    schoolLevel: '',
    subjects: [],
    preferredSchedule: '',
    hoursPerWeek: '',
    message: 'Bonjour, j\'aimerais savoir si vous offrez des cours de groupe ou seulement individuels? Et quels sont vos tarifs pour le niveau primaire? Merci!',
    submittedAt: new Date('2026-03-02T10:30:00').toISOString(),
    read: true,
    status: 'contacted'
  },
  {
    id: 'contact-10',
    firstName: 'Patrick',
    lastName: 'Côté',
    email: 'p.cote@gmail.com',
    phone: '514-555-7777',
    requestType: 'student',
    schoolLevel: 'Secondaire',
    subjects: ['Mathématiques', 'Physique'],
    preferredSchedule: 'Weekends',
    hoursPerWeek: '4 heures',
    message: 'Ma fille est en secondaire 5 sciences fortes et elle veut vraiment bien performer pour entrer en sciences de la santé au cégep. Elle a besoin d\'un tuteur expérimenté en maths et physique. Budget flexible.',
    submittedAt: new Date('2026-03-03T13:15:00').toISOString(),
    read: false,
    status: 'pending'
  }
];

// Fonction pour initialiser les messages mock dans localStorage si besoin
export const initializeMockContactMessages = () => {
  const existing = localStorage.getItem('contactMessages');
  if (!existing) {
    localStorage.setItem('contactMessages', JSON.stringify(mockContactMessages));
    console.log('Messages de contact mock initialisés');
  }
};
