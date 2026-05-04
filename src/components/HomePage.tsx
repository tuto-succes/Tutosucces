import summerCoursesNewImg from 'figma:asset/a87428688b3587c71f159e4536d833b469add726.png';
import whoWeAreImg from 'figma:asset/8c0622eba8d9fa17cfad87e745fa56f64bcd079f.png';
import divineNewImg from 'figma:asset/9881200ed39b9d422c75f87a05f40368a09f2ea3.png';
import brahelNewImg from 'figma:asset/e6d7e243498f9fb6cc38493b3ed0b2f76e442856.png';
import { supabase } from '../utils/supabase/client';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Users, CheckCircle, Clock, MessageSquare, Star, ChevronDown, Menu, X } from 'lucide-react';
import { Input } from './ui/input';
import { Footer } from './Footer';
import tutorStudentImg from 'figma:asset/02a73eb17bfb00543bc7c0877d48150937c10444.png';
import mentorImg from 'figma:asset/0664ef0699db415a2fe5552e702a44a19ade58f1.png';
import examPrepImg from 'figma:asset/ca692b716199e649918085a62c9bedcd51862291.png';
import summerCoursesImg from 'figma:asset/db25a9b089e3dba175469e90d1b07ce7bf861690.png';
import aboutUsImg from 'figma:asset/678bd814f57c91a223f9856cd9bbf539afbca63b.png';
import divineImg from 'figma:asset/32f30126ab996d74d7433a2c130c0b680b263198.png';
import brahelImg from 'figma:asset/19a490ea0e19e0146854bf75116d1137dc53c9d8.png';
import logoImg from 'figma:asset/bf7daf7f4d90880ea5fa593b28754dac8a736020.png';
import carouselImg1 from 'figma:asset/8c0622eba8d9fa17cfad87e745fa56f64bcd079f.png';
import carouselImg2 from 'figma:asset/1faebc4be5147a3a154c87e686c536b999d04b7e.png';
import carouselImg3 from 'figma:asset/37e01878d477b2fa98e5a3c515156e7b3ba6e51e.png';
import carouselImg4 from 'figma:asset/f6b2bca6a82ee2769f6e5b3505df8795d7984e63.png';
import carouselImg5 from 'figma:asset/a92e8b300ffb890287b5937f7614bd5a5d53e226.png';
import primaireImg from 'figma:asset/1faebc4be5147a3a154c87e686c536b999d04b7e.png';
import secondaireImg from 'figma:asset/c91b528764b310164029166422041b63908f3dbc.png';
import cegepImg from 'figma:asset/49e00a6f6b674f124446502bcd8002fe88e0975a.png';
import homeworkHelpImg from 'figma:asset/37e01878d477b2fa98e5a3c515156e7b3ba6e51e.png';
import mentoringImg from 'figma:asset/9604c7c0b03bcc3cf1c0f392ecbb323c6ea23074.png';
import examPrepNewImg from 'figma:asset/59787380c4fa6181547d89185bf4029e66b8eb21.png';

interface HomePageProps {
  onLogin: () => void;
  onSignup: () => void;
  onNavigateToConfidentialite?: () => void;
  onNavigateToAnnulation?: () => void;
  onNavigateToApproche?: () => void;
  onNavigateToEquipe?: () => void;
  onNavigateToTermes?: () => void;
  onNavigateToContact?: () => void;
  onNavigateToInscription?: () => void;
  onNavigateToInscriptionEleve?: () => void;
  onNavigateToContactSimple?: () => void;
}

// Données des matières par niveau
const subjectsByLevel = {
  primaire: [
    'Mathématiques',
    'Sciences',
    'Français',
    'Anglais',
    'Mentorat'
  ],
  secondaire: [
    'Mathématiques',
    'Sciences',
    'Physique',
    'Chimie',
    'Français',
    'Anglais',
    'Mentorat'
  ],
  cegep: [
    'Calcul I et Calcul II',
    'Algèbre linéaire',
    'Chimie générale',
    'Chimie des solutions',
    'Chimie organique',
    'Physique mécanique',
    'Électricité et magnétisme',
    'Ondes et physique moderne',
    'Français',
    'Anglais'
  ]
};

export function HomePage({ onLogin, onSignup, onNavigateToConfidentialite, onNavigateToAnnulation, onNavigateToApproche, onNavigateToEquipe, onNavigateToTermes, onNavigateToContact, onNavigateToInscription, onNavigateToInscriptionEleve, onNavigateToContactSimple }: HomePageProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<'primaire' | 'secondaire' | 'cegep' | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterMessage, setNewsletterMessage] = useState('');

  const statsSlides = [
    // Slide 1: Stat rouge
    {
      number: '10+',
      text: 'matières offertes',
      type: 'stat',
      color: '#E74C3C'
    },
    // Slide 2: Image 1
    {
      image: carouselImg1,
      alt: 'Élèves en action',
      type: 'image'
    },
    // Slide 3: Stat bleu
    {
      number: '20+',
      text: 'tuteurs/tutrices engagés',
      type: 'stat',
      color: '#2E5CA8'
    },
    // Slide 4: Image 2
    {
      image: carouselImg2,
      alt: 'Mentorat',
      type: 'image'
    },
    // Slide 5: Stat violet
    {
      number: '100+',
      text: 'élèves aidés',
      type: 'stat',
      color: '#9B59B6'
    },
    // Slide 6: Image 3
    {
      image: carouselImg3,
      alt: 'Préparation examens',
      type: 'image'
    },
    // Slide 7: Stat orange
    {
      number: '2500+',
      text: 'heures complétées',
      type: 'stat',
      color: '#E67E22'
    },
    // Slide 8: Image 4 (tutrice avec élève)
    {
      image: carouselImg4,
      alt: 'Séance de tutorat',
      type: 'image'
    },
    // Slide 9: Stat teal
    {
      number: '93%',
      text: 'd\'amélioration de notes',
      type: 'stat',
      color: '#16A085'
    },
    // Slide 10: Image 5 (classe)
    {
      image: carouselImg5,
      alt: 'Élèves en classe',
      type: 'image'
    }
  ];

  const testimonials = [
    {
      name: "Victoire Lambert",
      category: "Élève",
      text: "À ma rentrée au cégep, j'ai eu énormément de difficultés à suivre le rythme d'enseignement, et donc, j'ai demandé à mes parents si je pouvais avoir une tutrice. Ça fait maintenant plus d'un an que Jana m'accompagne dans mon parcours académique et elle est la tutrice la plus attentive que j'ai eue. Lorsque je lui pose des questions en dehors de nos séances de tutorat, elle y répond rapidement et efficacement."
    },
    {
      name: "Victoria Bergeron",
      category: "Élève",
      text: "I used to struggle with math all through elementary and early high school, rarely scoring above 60%. That changed when I began tutoring with Leonaes. My grades improved dramatically — I even moved from regular math to SN, maintaining averages above 85%. But beyond grades, Tuto-Succès helped me face exams without fear and believe in myself. Leonaes created a kind, encouraging environment where I could learn and grow without judgment. I had many tutors before, but none matched the patience and genuine care Leonaes showed."
    },
    {
      name: "Mme Grâce, Mère de Gabrielle et Ava",
      category: "Parent",
      text: "J'ai confié mes filles avec un calme et une grande confiance à TutoSuccès, car je sais qu'elles y sont bien encadrées. L'an dernier, l'une était en 3e année et l'autre en secondaire 1, et chacune a bénéficié d'un suivi attentif et personnalisé. Leur tutrice, ainsi que Brahel, étaient toujours disponibles, transparents et motivants. Je suis très fière de l'engagement de ce jeune homme Brahel pour et pour la réussite des jeunes qu'il a à coeur. Son dévouement est sincèrement apprécié. Je recommande TutoSuccès sans hésitation."
    },
    {
      name: "Mme Caroline, Mère de Sopha Coralie",
      category: "Parent",
      text: "J'adresse mes remerciements à toute l'équipe du tutorat pour votre excellent travail et surtout votre professionnalisme hors pair… Grâce à votre accompagnement, mes enfants ont repris confiance en elles et leurs notes se sont grandement améliorées… Ce que j'apprécie particulièrement, c'est votre compte rendu de progression. Il est vraiment pertinent, les points soulignés sont justes et je suis totalement en accord."
    },
    {
      name: "Audrina Tatchinda",
      category: "Tutrice",
      text: "J'aime vraiment accompagner les jeunes dans leur réussite académique, et TutoSuccès est une plateforme qui valorise pleinement cet engagement. Le professionnalisme qui règne au sein de cette initiative est ce que j'apprécie le plus. J'ai réellement l'impression de contribuer à la progression des étudiants, et les rapports de suivi que nous, tuteurs et tutrices, rédigeons renforcent ce sentiment."
    },
    {
      name: "Amadou Houla Sanda",
      category: "Tuteur",
      text: "Faire du tutorat avec Tuto Succès était une expérience très gratifiante. J'ai pu observer le développement académique et personnel des élèves tout au long de l'année. Avec Tuto Succès on se sent bien épaulé pour accompagner les élèves."
    }
  ];

  // Auto-play carousel for stats
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % statsSlides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [statsSlides.length]);

  // Auto-play carousel for testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % statsSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + statsSlides.length) % statsSlides.length);
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const getVisibleSlides = () => {
    const slides = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentSlide + i) % statsSlides.length;
      slides.push({ ...statsSlides[index], index });
    }
    return slides;
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterStatus('loading');
    setNewsletterMessage('');

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email: newsletterEmail });

      if (error) {
        if (error.code === '23505') {
          setNewsletterStatus('success');
          setNewsletterMessage('Vous êtes déjà inscrit à notre infolettre !');
        } else {
          throw error;
        }
      } else {
        setNewsletterStatus('success');
        setNewsletterMessage('Merci ! Vous êtes maintenant inscrit à notre infolettre.');
        setNewsletterEmail('');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setNewsletterStatus('error');
      setNewsletterMessage('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Modal pour afficher les matières */}
      {selectedLevel && (
        <div 
          className="fixed inset-0 backdrop-blur-md bg-white/30 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedLevel(null)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header du modal */}
            <div 
              className="p-8 rounded-t-3xl"
              style={{ 
                background: selectedLevel === 'primaire' 
                  ? 'linear-gradient(135deg, #E74C3C 0%, #2E5CA8 100%)'
                  : selectedLevel === 'secondaire'
                  ? 'linear-gradient(135deg, #2E5CA8 0%, #9B59B6 100%)'
                  : 'linear-gradient(135deg, #9B59B6 0%, #E74C3C 100%)'
              }}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-3xl font-bold text-white capitalize">
                  {selectedLevel}
                </h3>
                <button
                  onClick={() => setSelectedLevel(null)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
                >
                  <X size={28} />
                </button>
              </div>
              <p className="text-white mt-2 opacity-90">
                Matières offertes pour ce niveau
              </p>
            </div>

            {/* Liste des matières */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subjectsByLevel[selectedLevel].map((subject, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-4 rounded-xl border-2 hover:shadow-md transition-all"
                    style={{ borderColor: '#E0E0E0' }}
                  >
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: '#E3F2FD' }}
                    >
                      <CheckCircle size={20} style={{ color: '#2E5CA8' }} />
                    </div>
                    <span className="font-medium" style={{ color: '#2C3E50' }}>
                      {subject}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bouton d'action */}
              <div className="mt-8 text-center">
                <Button
                  onClick={() => {
                    setSelectedLevel(null);
                    onNavigateToInscriptionEleve?.();
                  }}
                  className="text-white px-10 py-4 text-lg rounded-xl shadow-lg"
                  style={{ backgroundColor: '#E74C3C' }}
                >
                  Trouver un tuteur
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Logo Tuto-Succès B&D" className="h-12" />
            <div className="flex flex-col">
              <h1 className="text-xl font-bold" style={{ color: '#2C3E50' }}>Tuto-Succès B&D</h1>
              <span className="text-xs tracking-wide" style={{ color: '#7F8C8D' }}>EN LIGNE</span>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a 
              href="#accueil" 
              className="transition-colors" 
              style={{ color: '#7F8C8D' }} 
              onMouseOver={(e) => e.currentTarget.style.color = '#E74C3C'} 
              onMouseOut={(e) => e.currentTarget.style.color = '#7F8C8D'}
            >
              Accueil
            </a>
            
            {/* Dropdown À propos */}
            <div 
              className="relative"
            >
              <button 
                className="flex items-center gap-1 transition-colors" 
                style={{ color: '#7F8C8D' }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = '#E74C3C';
                  setIsDropdownOpen(true);
                }}
                onMouseOut={(e) => e.currentTarget.style.color = isDropdownOpen ? '#E74C3C' : '#7F8C8D'}
              >
                À propos
                <ChevronDown size={16} className={isDropdownOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
              </button>
              
              {isDropdownOpen && (
                <div 
                  className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-lg overflow-hidden min-w-[240px] z-50"
                  onMouseEnter={() => setIsDropdownOpen(true)}
                  onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  <button
                    onClick={() => {
                      onNavigateToConfidentialite?.();
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 transition-colors text-sm"
                    style={{ color: '#7F8C8D' }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#F8F9FA';
                      e.currentTarget.style.color = '#E74C3C';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.color = '#7F8C8D';
                    }}
                  >
                    Politique de confidentialité
                  </button>
                  <button
                    onClick={() => {
                      onNavigateToAnnulation?.();
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 transition-colors text-sm"
                    style={{ color: '#7F8C8D' }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#F8F9FA';
                      e.currentTarget.style.color = '#E74C3C';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.color = '#7F8C8D';
                    }}
                  >
                    Politique d'annulation
                  </button>
                  <button
                    onClick={() => {
                      onNavigateToApproche?.();
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 transition-colors text-sm"
                    style={{ color: '#7F8C8D' }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#F8F9FA';
                      e.currentTarget.style.color = '#E74C3C';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.color = '#7F8C8D';
                    }}
                  >
                    Notre Approche
                  </button>
                  <button
                    onClick={() => {
                      onNavigateToEquipe?.();
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 transition-colors text-sm"
                    style={{ color: '#7F8C8D' }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#F8F9FA';
                      e.currentTarget.style.color = '#E74C3C';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.color = '#7F8C8D';
                    }}
                  >
                    Notre Équipe
                  </button>
                </div>
              )}
            </div>
            
            <a 
              href="#services" 
              className="transition-colors" 
              style={{ color: '#7F8C8D' }} 
              onMouseOver={(e) => e.currentTarget.style.color = '#E74C3C'} 
              onMouseOut={(e) => e.currentTarget.style.color = '#7F8C8D'}
            >
              Nos services
            </a>
            
            <button 
              onClick={() => onNavigateToTermes?.()}
              className="transition-colors" 
              style={{ color: '#7F8C8D' }} 
              onMouseOver={(e) => e.currentTarget.style.color = '#E74C3C'} 
              onMouseOut={(e) => e.currentTarget.style.color = '#7F8C8D'}
            >
              Termes et conditions
            </button>
          </nav>
          
          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Devenir tuteur Button */}
            <Button 
              onClick={onNavigateToInscription}
              className="flex items-center gap-2 px-6 py-2 rounded-full border-2"
              style={{ 
                backgroundColor: 'transparent',
                borderColor: '#E74C3C',
                color: '#E74C3C'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#E74C3C';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#E74C3C';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
              </svg>
              Devenir tuteur
            </Button>

            {/* Login Button */}
            <Button 
              onClick={onLogin}
              className="flex items-center gap-2 text-white px-6 py-2 rounded-full"
              style={{ backgroundColor: '#E74C3C' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#C0392B'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#E74C3C'}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 8C10.21 8 12 6.21 12 4C12 1.79 10.21 0 8 0C5.79 0 4 1.79 4 4C4 6.21 5.79 8 8 8ZM8 10C5.33 10 0 11.34 0 14V16H16V14C16 11.34 10.67 10 8 10Z" fill="currentColor"/>
              </svg>
              Connexion
            </Button>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2"
            style={{ color: '#7F8C8D' }}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t" style={{ borderColor: '#F8F9FA' }}>
            <nav className="flex flex-col px-4 py-4 space-y-3">
              <a 
                href="#accueil" 
                className="py-2 transition-colors" 
                style={{ color: '#7F8C8D' }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Accueil
              </a>
              
              <div>
                <button 
                  className="flex items-center justify-between w-full py-2 transition-colors" 
                  style={{ color: '#7F8C8D' }}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  À propos
                  <ChevronDown size={16} className={isDropdownOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
                </button>
                
                {isDropdownOpen && (
                  <div className="pl-4 space-y-2 mt-2">
                    <a 
                      href="#confidentialite" 
                      className="block py-2 text-sm transition-colors"
                      style={{ color: '#7F8C8D' }}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsDropdownOpen(false);
                        onNavigateToConfidentialite?.();
                      }}
                    >
                      Politique de confidentialité
                    </a>
                    <a 
                      href="#annulation" 
                      className="block py-2 text-sm transition-colors"
                      style={{ color: '#7F8C8D' }}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsDropdownOpen(false);
                        onNavigateToAnnulation?.();
                      }}
                    >
                      Politique d'annulation
                    </a>
                    <a 
                      href="#notre-approche" 
                      className="block py-2 text-sm transition-colors"
                      style={{ color: '#7F8C8D' }}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsDropdownOpen(false);
                        onNavigateToApproche?.();
                      }}
                    >
                      Notre Approche
                    </a>
                    <a 
                      href="#notre-equipe" 
                      className="block py-2 text-sm transition-colors"
                      style={{ color: '#7F8C8D' }}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsDropdownOpen(false);
                        onNavigateToEquipe?.();
                      }}
                    >
                      Notre Équipe
                    </a>
                  </div>
                )}
              </div>
              
              <a 
                href="#services" 
                className="py-2 transition-colors" 
                style={{ color: '#7F8C8D' }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Nos services
              </a>
              
              <button 
                onClick={() => {
                  onNavigateToTermes?.();
                  setIsMobileMenuOpen(false);
                }}
                className="py-2 transition-colors text-left w-full" 
                style={{ color: '#7F8C8D' }}
              >
                Termes et conditions
              </button>
              
              <Button 
                onClick={() => {
                  onNavigateToInscription?.();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full mt-4 border-2"
                style={{ 
                  backgroundColor: 'transparent',
                  borderColor: '#E74C3C',
                  color: '#E74C3C'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                </svg>
                Devenir tuteur
              </Button>
              
              <Button 
                onClick={() => {
                  onLogin();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 text-white px-6 py-3 rounded-full"
                style={{ backgroundColor: '#E74C3C' }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 8C10.21 8 12 6.21 12 4C12 1.79 10.21 0 8 0C5.79 0 4 1.79 4 4C4 6.21 5.79 8 8 8ZM8 10C5.33 10 0 11.34 0 14V16H16V14C16 11.34 10.67 10 8 10Z" fill="currentColor"/>
                </svg>
                Connexion
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section 
        id="accueil"
        className="relative py-24 md:py-32"
        style={{ background: 'linear-gradient(135deg, #E74C3C 0%, #2E5CA8 100%)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            L'effort, la persévérance et l'encadrement<br />
            mènent à la réussite
          </h2>
          <p className="text-xl text-white mb-8 opacity-90">
            Tutorat privé 100% en ligne
          </p>
          <Button 
            onClick={() => onNavigateToContactSimple?.()}
            size="lg"
            className="text-white px-8 py-6 text-lg rounded-full shadow-lg"
            style={{ backgroundColor: '#FFFFFF', color: '#E74C3C' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8F9FA'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
          >
            Commencer dès maintenant
          </Button>
        </div>
      </section>

      {/* Stats Carousel Section */}
      <section className="py-16" style={{ backgroundColor: '#F8F9FA' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <ChevronLeft 
              className="absolute left-2 top-1/2 transform -translate-y-1/2 cursor-pointer z-10"
              style={{ color: '#7F8C8D' }}
              size={32}
              onClick={prevSlide}
            />
            <ChevronRight 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer z-10"
              style={{ color: '#7F8C8D' }}
              size={32}
              onClick={nextSlide}
            />
            <div className="flex overflow-hidden">
              {getVisibleSlides().map((slide) => (
                <div key={slide.index} className="px-3 flex-1 min-w-0">
                  {slide.type === 'stat' ? (
                    <div className="rounded-2xl p-12 text-center h-64 flex flex-col items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${slide.color} 0%, #2E5CA8 100%)` }}>
                      <div className="text-6xl font-bold text-white mb-3">
                        {slide.number}
                      </div>
                      <div className="text-xl text-white font-medium">
                        {slide.text}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl overflow-hidden h-64 shadow-lg">
                      <img 
                        src={slide.image} 
                        alt={slide.alt} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Matières et niveaux scolaires Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-bold text-center mb-4" style={{ color: '#2C3E50' }}>
            Matières et niveaux scolaires
          </h3>
          <div className="w-24 h-1 mx-auto mb-12" style={{ backgroundColor: '#E74C3C' }}></div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Primaire */}
            <button
              onClick={() => setSelectedLevel('primaire')}
              className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer text-left"
            >
              <img 
                src={primaireImg}
                alt="Élèves primaire"
                className="w-full h-80 object-cover"
              />
              <div className="p-8 bg-white text-center">
                <h4 className="text-2xl font-bold" style={{ color: '#2C3E50' }}>Primaire</h4>
              </div>
            </button>

            {/* Secondaire */}
            <button
              onClick={() => setSelectedLevel('secondaire')}
              className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer text-left"
            >
              <img 
                src={secondaireImg}
                alt="Élèves secondaire"
                className="w-full h-80 object-cover"
              />
              <div className="p-8 bg-white text-center">
                <h4 className="text-2xl font-bold" style={{ color: '#2C3E50' }}>Secondaire</h4>
              </div>
            </button>

            {/* Cégep */}
            <button
              onClick={() => setSelectedLevel('cegep')}
              className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer text-left"
            >
              <img 
                src={cegepImg}
                alt="Élèves cégep"
                className="w-full h-80 object-cover"
              />
              <div className="p-8 bg-white text-center">
                <h4 className="text-2xl font-bold" style={{ color: '#2C3E50' }}>Cégep</h4>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Nos Services Section */}
      <section id="services" className="py-20" style={{ backgroundColor: '#F8F9FA' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-bold text-center mb-4" style={{ color: '#2C3E50' }}>
            Nos services
          </h3>
          <div className="w-24 h-1 mx-auto mb-16" style={{ backgroundColor: '#E74C3C' }}></div>

          {/* 1. Aide aux devoirs */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-6 order-2 md:order-1">
              <p className="text-lg leading-relaxed" style={{ color: '#7F8C8D' }}>
                Soutien quotidien pour accompagner les élèves dans leurs travaux scolaires, 
                clarifier les concepts et développer l'autonomie dans l'apprentissage.
              </p>
              <h4 className="text-3xl font-bold" style={{ color: '#2C3E50' }}>
                Aide aux devoirs
              </h4>
              <Button 
                onClick={() => onNavigateToInscriptionEleve?.()}
                className="text-white px-8 py-6 text-lg rounded-lg shadow-lg"
                style={{ backgroundColor: '#E74C3C' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#C0392B'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#E74C3C'}
              >
                Trouver un tuteur
              </Button>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-2xl order-1 md:order-2">
              <img 
                src={homeworkHelpImg}
                alt="Aide aux devoirs"
                className="w-full h-96 object-cover"
              />
            </div>
          </div>

          {/* 2. Mentorat */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src={mentoringImg}
                alt="Mentorat"
                className="w-full h-96 object-cover"
              />
            </div>
            <div className="space-y-6">
              <p className="text-lg leading-relaxed" style={{ color: '#7F8C8D' }}>
                Accompagnement régulier pour développer de bonnes méthodes d'étude, 
                renforcer la motivation et atteindre les objectifs scolaires.
              </p>
              <h4 className="text-3xl font-bold" style={{ color: '#2C3E50' }}>
                Mentorat
              </h4>
              <Button 
                onClick={() => onNavigateToInscriptionEleve?.()}
                className="text-white px-8 py-6 text-lg rounded-lg shadow-lg"
                style={{ backgroundColor: '#E74C3C' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#C0392B'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#E74C3C'}
              >
                Trouver un mentor
              </Button>
            </div>
          </div>

          {/* 3. Préparation aux examens */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-6 order-2 md:order-1">
              <p className="text-lg leading-relaxed" style={{ color: '#7F8C8D' }}>
                Révisions ciblées, exercices types et stratégies efficaces pour réussir les examens en toute confiance.
              </p>
              <h4 className="text-3xl font-bold" style={{ color: '#2C3E50' }}>
                Préparation aux examens
              </h4>
              <Button 
                onClick={() => onNavigateToInscriptionEleve?.()}
                className="text-white px-8 py-6 text-lg rounded-lg shadow-lg"
                style={{ backgroundColor: '#E74C3C' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#C0392B'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#E74C3C'}
              >
                Trouver un tuteur
              </Button>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-2xl order-1 md:order-2">
              <img 
                src={examPrepNewImg}
                alt="Préparation aux examens"
                className="w-full h-96 object-cover"
              />
            </div>
          </div>

          {/* 4. Cours d'été */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src={summerCoursesNewImg}
                alt="Cours d'été"
                className="w-full h-96 object-cover"
              />
            </div>
            <div className="space-y-6">
              <p className="text-lg leading-relaxed" style={{ color: '#7F8C8D' }}>
                Cours intensifs et sur mesure pour combler les lacunes, revoir les bases ou prendre de l'avance avant la rentrée.
              </p>
              <h4 className="text-3xl font-bold" style={{ color: '#2C3E50' }}>
                Cours d'été
              </h4>
              <Button 
                onClick={() => onNavigateToInscription?.()}
                className="text-white px-8 py-6 text-lg rounded-lg shadow-lg"
                style={{ backgroundColor: '#E74C3C' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#C0392B'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#E74C3C'}
              >
                Trouver un tuteur
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Qui sommes-nous Section */}
      <section id="propos" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-bold text-center mb-4" style={{ color: '#2C3E50' }}>
            Qui sommes-nous ?
          </h3>
          <div className="w-24 h-1 mx-auto mb-12" style={{ backgroundColor: '#E74C3C' }}></div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src={whoWeAreImg}
                alt="Qui sommes-nous"
                className="w-full h-96 object-cover"
              />
            </div>
            <div className="space-y-6">
              <h4 className="text-2xl font-bold" style={{ color: '#E74C3C' }}>
                Un accompagnement personnalisé vers la réussite scolaire!
              </h4>
              <p className="leading-relaxed text-justify" style={{ color: '#7F8C8D' }}>
                Tuto-Succès B&D est un service de tutorat dédié à soutenir les élèves du primaire 
                jusqu'au secondaire, ainsi que les étudiants du CEGEP dans certaines matières. Notre 
                mission est d'accompagner, encadrer et collaborer avec chaque étudiant pour 
                promouvoir leur autonomie et leur succès scolaire à travers une approche individualisée 
                et humaine.
              </p>
              <p className="leading-relaxed text-justify" style={{ color: '#7F8C8D' }}>
                Nous croyons que chaque élève a le potentiel de réussir, mais que leur succès dépend 
                souvent de facteurs tels que la motivation, l'organisation et la confiance en soi. C'est 
                pourquoi Tuto-Succès propose des stratégies personnalisées pour permettre aux 
                étudiants d'acquérir non seulement des compétences académiques, mais aussi des outils 
                pour surmonter leurs difficultés et devenir autonomes dans leur apprentissage.
              </p>
              <Button 
                onClick={() => onNavigateToApproche?.()}
                variant="outline"
                className="border-2 text-white px-8 py-3 text-lg rounded-lg"
                style={{ borderColor: '#2E5CA8', color: '#2E5CA8' }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#2E5CA8';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#2E5CA8';
                }}
              >
                Notre approche
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pourquoi nous choisir Section */}
      <section className="py-20" style={{ backgroundColor: '#F8F9FA' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-bold text-center mb-4" style={{ color: '#2C3E50' }}>
            Pourquoi nous choisir ?
          </h3>
          <div className="w-24 h-1 mx-auto mb-16" style={{ backgroundColor: '#E74C3C' }}></div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#E3F2FD' }}>
                <Users className="w-8 h-8" style={{ color: '#2E5CA8' }} />
              </div>
              <h4 className="text-xl font-bold mb-4" style={{ color: '#2C3E50' }}>
                Un encadrement individualisé et professionnel
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: '#7F8C8D' }}>
                Chaque étudiant bénéficie d'un suivi personnalisé adapté à ses besoins et objectifs spécifiques.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#E3F2FD' }}>
                <CheckCircle className="w-8 h-8" style={{ color: '#2E5CA8' }} />
              </div>
              <h4 className="text-xl font-bold mb-4" style={{ color: '#2C3E50' }}>
                Encourager l'autonomie et la confiance en soi
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: '#7F8C8D' }}>
                Nous développons les compétences et la confiance nécessaires pour réussir de manière autonome.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#E3F2FD' }}>
                <Clock className="w-8 h-8" style={{ color: '#2E5CA8' }} />
              </div>
              <h4 className="text-xl font-bold mb-4" style={{ color: '#2C3E50' }}>
                Horaires adaptés à l'étudiant(e)
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: '#7F8C8D' }}>
                Des plages horaires flexibles qui s'ajustent à votre emploi du temps pour un apprentissage sans contrainte.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#E3F2FD' }}>
                <MessageSquare className="w-8 h-8" style={{ color: '#2E5CA8' }} />
              </div>
              <h4 className="text-xl font-bold mb-4" style={{ color: '#2C3E50' }}>
                Une communication ouverte avec les parents
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: '#7F8C8D' }}>
                Dialogue constant pour suivre les progrès et adapter l'accompagnement en fonction des besoins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Nos tarifs Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-bold text-center mb-4" style={{ color: '#2C3E50' }}>
            Nos tarifs
          </h3>
          <div className="w-24 h-1 mx-auto mb-16" style={{ backgroundColor: '#E74C3C' }}></div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* 1 heure/semaine */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center border" style={{ borderColor: '#E0E0E0' }}>
              <h4 className="text-xl font-semibold mb-6" style={{ color: '#2C3E50' }}>
                1 heure/semaine
              </h4>
              <div className="mb-6">
                <span className="text-5xl font-bold" style={{ color: '#E74C3C' }}>60$</span>
                <span style={{ color: '#7F8C8D' }}>/heure</span>
              </div>
              <Button 
                onClick={() => onNavigateToContactSimple?.()}
                className="text-white px-8 py-3 rounded-full w-full"
                style={{ backgroundColor: '#E74C3C' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#C0392B'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#E74C3C'}
              >
                Commencer
              </Button>
            </div>

            {/* 3 heures/semaine - Populaire */}
            <div className="rounded-2xl p-8 shadow-2xl text-center relative transform scale-105" style={{ background: 'linear-gradient(135deg, #E74C3C 0%, #2E5CA8 100%)' }}>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-white px-6 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: '#E74C3C' }}>
                Populaire
              </div>
              <h4 className="text-xl font-semibold text-white mb-6">
                3 heures/semaine
              </h4>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">55$</span>
                <span className="text-white opacity-90">/heure</span>
              </div>
              <Button 
                onClick={() => onNavigateToContactSimple?.()}
                className="px-8 py-3 rounded-full w-full"
                style={{ backgroundColor: '#FFFFFF', color: '#E74C3C' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8F9FA'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
              >
                Commencer
              </Button>
            </div>

            {/* 4+ heures/semaine */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center border" style={{ borderColor: '#E0E0E0' }}>
              <h4 className="text-xl font-semibold mb-6" style={{ color: '#2C3E50' }}>
                4+ heures/semaine
              </h4>
              <div className="mb-6">
                <span className="text-5xl font-bold" style={{ color: '#E74C3C' }}>50$</span>
                <span style={{ color: '#7F8C8D' }}>/heure</span>
              </div>
              <Button 
                onClick={() => onNavigateToContactSimple?.()}
                className="text-white px-8 py-3 rounded-full w-full"
                style={{ backgroundColor: '#E74C3C' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#C0392B'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#E74C3C'}
              >
                Commencer
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16" style={{ backgroundColor: '#2E5CA8' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Abonnez-vous à notre infolettre pour rester informé !
          </h3>
          <p className="text-white mb-8 opacity-90">
            Saisissez votre e-mail ici
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <Input 
              type="email"
              placeholder="Votre adresse e-mail"
              className="flex-1 px-6 py-3 rounded-lg"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
            />
            <Button 
              className="text-white px-8 py-3 rounded-lg"
              style={{ backgroundColor: '#2C3E50' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1A252F'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2C3E50'}
              onClick={handleNewsletterSubmit}
              disabled={newsletterStatus === 'loading'}
            >
              {newsletterStatus === 'loading' ? 'Chargement...' : 'S\'inscrire'}
            </Button>
          </div>
          {newsletterStatus !== 'idle' && (
            <p className="text-white text-sm mt-4 font-medium">
              {newsletterMessage}
            </p>
          )}
        </div>
      </section>

      {/* Co-fondateurs Section */}
      <section className="py-20" style={{ backgroundColor: '#F8F9FA' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-bold text-center mb-4" style={{ color: '#2C3E50' }}>
            Co-fondateurs de Tuto-Succès B&D
          </h3>
          <p className="text-center mb-8" style={{ color: '#7F8C8D' }}>
            Nous sélectionnons avec soin des tuteurs passionnés, qualifiés et dévoués à la réussite de chaque élève.
          </p>
          <div className="text-center mb-12">
            <Button 
              onClick={() => onNavigateToEquipe?.()}
              variant="outline"
              className="border-2 px-8 py-3 text-lg rounded-lg"
              style={{ borderColor: '#E74C3C', color: '#E74C3C' }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#E74C3C';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#E74C3C';
              }}
            >
              Notre équipe
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Divine Tatchinda */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
              <img 
                src={divineNewImg}
                alt="Divine Tatchinda"
                className="w-full h-80 object-cover object-top"
              />
              <div className="p-6 text-center">
                <h4 className="text-2xl font-bold mb-2" style={{ color: '#2C3E50' }}>
                  Divine Tatchinda
                </h4>
                <p style={{ color: '#7F8C8D' }}>
                  Candidat à la faculté de droit, Université McGill
                </p>
              </div>
            </div>

            {/* Brahel Tatchinda */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
              <img 
                src={brahelNewImg}
                alt="Brahel Tatchinda"
                className="w-full h-80 object-cover object-top"
              />
              <div className="p-6 text-center">
                <h4 className="text-2xl font-bold mb-2" style={{ color: '#2C3E50' }}>
                  Brahel Tatchinda
                </h4>
                <p style={{ color: '#7F8C8D' }}>
                  Candidat à la faculté de Médecine, Université McGill
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Notre impact Section */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, #F8F9FA 0%, #E3F2FD 50%, #FCE4EC 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-bold text-center mb-16" style={{ color: '#2C3E50' }}>
            Notre impact
          </h3>

          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl p-12 shadow-xl text-center">
              {/* 5 étoiles */}
              <div className="flex justify-center gap-2 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Catégorie et Nom */}
              <p className="text-lg font-semibold mb-6" style={{ color: '#2C3E50' }}>
                {testimonials[currentTestimonial].category} - {testimonials[currentTestimonial].name}
              </p>

              {/* Témoignage */}
              <p className="leading-relaxed italic text-base" style={{ color: '#7F8C8D' }}>
                {testimonials[currentTestimonial].text}
              </p>
            </div>

            {/* Navigation pour carousel de témoignages */}
            <div className="flex justify-center items-center gap-8 mt-8">
              <button className="hover:opacity-80" style={{ color: '#7F8C8D' }} onClick={prevTestimonial}>
                <ChevronLeft size={32} />
              </button>
              <button className="hover:opacity-80" style={{ color: '#7F8C8D' }} onClick={nextTestimonial}>
                <ChevronRight size={32} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, #E74C3C 0%, #2E5CA8 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Ensemble, visons l'excellence académique
          </h3>
          <Button 
            size="lg" 
            onClick={() => onNavigateToContactSimple?.()}
            className="px-10 py-6 text-lg rounded-lg shadow-lg"
            style={{ backgroundColor: '#FFFFFF', color: '#E74C3C' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8F9FA'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
          >
            Commencer un essai gratuit
          </Button>
        </div>
      </section>

      <Footer
        onNavigateToHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onNavigateToServices={() => {
          const servicesSection = document.getElementById('services');
          if (servicesSection) {
            servicesSection.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        onNavigateToApproche={onNavigateToApproche}
        onNavigateToEquipe={onNavigateToEquipe}
        onNavigateToTermes={onNavigateToTermes}
        onNavigateToConfidentialite={onNavigateToConfidentialite}
        onNavigateToAnnulation={onNavigateToAnnulation}
        onNavigateToContact={onNavigateToContact}
      />
    </div>
  );
}