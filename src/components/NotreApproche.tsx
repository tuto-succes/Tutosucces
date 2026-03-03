import { ArrowLeft, Target, Users, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Footer } from './Footer';
import logoImg from 'figma:asset/bf7daf7f4d90880ea5fa593b28754dac8a736020.png';

interface NotreApprocheProps {
  onBack: () => void;
  onNavigateToServices?: () => void;
  onNavigateToEquipe?: () => void;
  onNavigateToTermes?: () => void;
  onNavigateToConfidentialite?: () => void;
  onNavigateToAnnulation?: () => void;
  onNavigateToContact?: () => void;
}

export function NotreApproche({ 
  onBack, 
  onNavigateToServices,
  onNavigateToEquipe, 
  onNavigateToTermes, 
  onNavigateToConfidentialite, 
  onNavigateToAnnulation, 
  onNavigateToContact 
}: NotreApprocheProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F9FA' }}>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="ghost"
            className="flex items-center gap-2"
            style={{ color: '#7F8C8D' }}
          >
            <ArrowLeft size={20} />
            Retour
          </Button>
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Logo Tuto-Succès B&D" className="h-12" />
            <div className="flex flex-col">
              <h1 className="text-xl font-bold" style={{ color: '#2C3E50' }}>Tuto-Succès B&D</h1>
              <span className="text-xs tracking-wide" style={{ color: '#7F8C8D' }}>EN LIGNE</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, #E74C3C 0%, #2E5CA8 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Notre Approche
          </h1>
          <p className="text-xl text-white opacity-90">
            Un accompagnement personnalisé vers la réussite scolaire
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Introduction */}
        <section className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <p className="text-lg leading-relaxed mb-6" style={{ color: '#7F8C8D' }}>
            Tuto-Succès est un service de tutorat dédié à soutenir les élèves du 2e cycle du primaire jusqu'au secondaire, ainsi que les étudiants du CEGEP dans certaines matières. Notre mission est d'accompagner, encadrer et collaborer avec chaque étudiant pour promouvoir leur autonomie et leur succès scolaire à travers une approche individualisée et humaine.
          </p>
          <p className="text-lg leading-relaxed" style={{ color: '#7F8C8D' }}>
            Nous croyons que chaque élève a le potentiel de réussir, mais que leur succès dépend souvent de facteurs tels que la motivation, l'organisation et la confiance en soi. C'est pourquoi Tuto-Succès propose des stratégies personnalisées pour permettre aux étudiants d'acquérir non seulement des compétences académiques, mais aussi des outils pour surmonter leurs difficultés et devenir autonomes dans leur apprentissage.
          </p>
        </section>

        {/* Les 3 piliers de notre approche */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Approche individualisée */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#FCE4EC' }}>
              <Target className="w-8 h-8" style={{ color: '#E74C3C' }} />
            </div>
            <h3 className="text-xl font-bold text-center mb-4" style={{ color: '#2C3E50' }}>
              Approche individualisée
            </h3>
            <p className="text-center leading-relaxed" style={{ color: '#7F8C8D' }}>
              Chaque plan est adapté au profil de l'élève : objectifs, niveau, rythme, difficultés, méthodes de travail et style d'apprentissage.
            </p>
          </div>

          {/* Encadrement structuré */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#E3F2FD' }}>
              <Users className="w-8 h-8" style={{ color: '#2E5CA8' }} />
            </div>
            <h3 className="text-xl font-bold text-center mb-4" style={{ color: '#2C3E50' }}>
              Encadrement structuré
            </h3>
            <p className="text-center leading-relaxed" style={{ color: '#7F8C8D' }}>
              Nous mettons en place une routine claire : révision, pratique ciblée, stratégies, et suivi de progression séance après séance.
            </p>
          </div>

          {/* Confiance et autonomie */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#FCE4EC' }}>
              <TrendingUp className="w-8 h-8" style={{ color: '#E74C3C' }} />
            </div>
            <h3 className="text-xl font-bold text-center mb-4" style={{ color: '#2C3E50' }}>
              Confiance et autonomie
            </h3>
            <p className="text-center leading-relaxed" style={{ color: '#7F8C8D' }}>
              L'objectif est de rendre l'élève plus autonome : mieux comprendre, mieux s'organiser et développer des réflexes durables.
            </p>
          </div>
        </div>

        {/* Notre méthode en détail */}
        <section className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: '#E74C3C' }}>
            Comment ça fonctionne ?
          </h2>

          <div className="space-y-6">
            <div className="border-l-4 pl-6 py-2" style={{ borderColor: '#2E5CA8' }}>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#2C3E50' }}>
                1. Évaluation initiale
              </h3>
              <p className="leading-relaxed" style={{ color: '#7F8C8D' }}>
                Nous commençons par identifier les besoins spécifiques de l'élève, ses forces, ses difficultés et ses objectifs académiques.
              </p>
            </div>

            <div className="border-l-4 pl-6 py-2" style={{ borderColor: '#E74C3C' }}>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#2C3E50' }}>
                2. Plan personnalisé
              </h3>
              <p className="leading-relaxed" style={{ color: '#7F8C8D' }}>
                Un plan d'apprentissage sur mesure est créé, tenant compte du rythme, du style d'apprentissage et des objectifs de chaque élève.
              </p>
            </div>

            <div className="border-l-4 pl-6 py-2" style={{ borderColor: '#2E5CA8' }}>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#2C3E50' }}>
                3. Séances structurées
              </h3>
              <p className="leading-relaxed" style={{ color: '#7F8C8D' }}>
                Chaque séance suit une structure claire : révision des concepts, pratique guidée, exercices autonomes et feedback constructif.
              </p>
            </div>

            <div className="border-l-4 pl-6 py-2" style={{ borderColor: '#E74C3C' }}>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#2C3E50' }}>
                4. Suivi et ajustement
              </h3>
              <p className="leading-relaxed" style={{ color: '#7F8C8D' }}>
                Nous suivons les progrès de l'élève de près et ajustons notre approche pour garantir une amélioration continue et durable.
              </p>
            </div>

            <div className="border-l-4 pl-6 py-2" style={{ borderColor: '#2E5CA8' }}>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#2C3E50' }}>
                5. Communication avec les parents
              </h3>
              <p className="leading-relaxed" style={{ color: '#7F8C8D' }}>
                Des bilans réguliers sont partagés avec les parents pour maintenir une transparence totale sur l'évolution de l'élève.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl p-12 text-center" style={{ background: 'linear-gradient(135deg, #E74C3C 0%, #2E5CA8 100%)' }}>
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à commencer votre parcours vers la réussite ?
          </h2>
          <p className="text-white text-lg mb-6 opacity-90">
            Rejoignez des centaines d'élèves qui ont transformé leur expérience scolaire avec Tuto-Succès B&D.
          </p>
          <Button
            onClick={onBack}
            size="lg"
            className="px-10 py-6 text-lg rounded-lg shadow-lg"
            style={{ backgroundColor: '#FFFFFF', color: '#E74C3C' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8F9FA'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
          >
            Commencer maintenant
          </Button>
        </section>
      </div>

      {/* Footer */}
      <Footer 
        onNavigateToHome={onBack}
        onNavigateToServices={onNavigateToServices}
        onNavigateToEquipe={onNavigateToEquipe}
        onNavigateToTermes={onNavigateToTermes}
        onNavigateToConfidentialite={onNavigateToConfidentialite}
        onNavigateToAnnulation={onNavigateToAnnulation}
        onNavigateToContact={onNavigateToContact}
      />
    </div>
  );
}