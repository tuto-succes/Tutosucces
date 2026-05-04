import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Footer } from './Footer';
import logoImg from 'figma:asset/bf7daf7f4d90880ea5fa593b28754dac8a736020.png';

interface PolitiqueAnnulationProps {
  onBack: () => void;
  onNavigateToServices?: () => void;
  onNavigateToApproche?: () => void;
  onNavigateToEquipe?: () => void;
  onNavigateToTermes?: () => void;
  onNavigateToConfidentialite?: () => void;
  onNavigateToContact?: () => void;
}

export function PolitiqueAnnulation({ onBack, onNavigateToServices, onNavigateToApproche, onNavigateToEquipe, onNavigateToTermes, onNavigateToConfidentialite, onNavigateToContact }: PolitiqueAnnulationProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
          <button
            onClick={onBack}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img src={logoImg} alt="Logo Tuto-Succès B&D" className="h-12" />
            <div className="flex flex-col">
              <h1 className="text-xl font-bold" style={{ color: '#2C3E50' }}>Tuto-Succès B&D</h1>
              <span className="text-xs tracking-wide" style={{ color: '#7F8C8D' }}>EN LIGNE</span>
            </div>
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-5xl font-bold text-center mb-8" style={{ color: '#2C3E50' }}>
          Politique d'annulation
        </h1>
        <div className="w-24 h-1 mx-auto mb-16" style={{ backgroundColor: '#E74C3C' }}></div>

        {/* Introduction */}
        <section className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <p className="leading-relaxed mb-4" style={{ color: '#7F8C8D' }}>
            Tuto-Succès B&D met tout en œuvre pour offrir un service flexible et adapté aux besoins des familles. Afin d'assurer un fonctionnement efficace, équitable et respectueux pour les élèves comme pour les tuteurs, la politique d'annulation suivante s'applique à toutes les séances de tutorat, sans exception.
          </p>
        </section>

        {/* 1. Annulation 24 heures à l'avance */}
        <section className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{ backgroundColor: '#E74C3C' }}>
              1
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#2C3E50' }}>
                Annulation 24 heures à l'avance
              </h2>
              <p className="leading-relaxed" style={{ color: '#7F8C8D' }}>
                Toute séance peut être annulée ou reportée sans frais si un avis est donné au moins 24 heures avant l'heure prévue de la séance.
              </p>
            </div>
          </div>
        </section>

        {/* 2. Annulation en cas d'urgence */}
        <section className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{ backgroundColor: '#E74C3C' }}>
              2
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#2C3E50' }}>
                Annulation en cas d'urgence
              </h2>
              <p className="leading-relaxed mb-4" style={{ color: '#7F8C8D' }}>
                En situation exceptionnelle (maladie soudaine, urgence familiale ou imprévu sérieux), l'élève ou le parent doit communiquer directement avec le tuteur par l'un des moyens suivants :
              </p>
              <ul className="space-y-2 pl-6">
                <li className="flex items-start gap-3">
                  <span className="text-xl" style={{ color: '#2E5CA8' }}>•</span>
                  <span style={{ color: '#7F8C8D' }}>message texte</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl" style={{ color: '#2E5CA8' }}>•</span>
                  <span style={{ color: '#7F8C8D' }}>appel téléphonique</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl" style={{ color: '#2E5CA8' }}>•</span>
                  <span style={{ color: '#7F8C8D' }}>courriel</span>
                </li>
              </ul>
              <p className="leading-relaxed mt-4" style={{ color: '#7F8C8D' }}>
                Une annulation effectuée sans contact direct avec le tuteur n'est pas considérée comme valide.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Annulation tardive */}
        <section className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{ backgroundColor: '#E74C3C' }}>
              3
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#2C3E50' }}>
                Annulation tardive
              </h2>
              <p className="leading-relaxed mb-4" style={{ color: '#7F8C8D' }}>
                Les règles suivantes s'appliquent lorsque l'avis est donné moins de 24 heures avant la séance :
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-xl" style={{ color: '#2E5CA8' }}>•</span>
                  <span style={{ color: '#7F8C8D' }}>Un avis donné moins de 24 heures avant la séance entraîne la facturation de <strong>50 %</strong> du coût de la séance.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl" style={{ color: '#2E5CA8' }}>•</span>
                  <span style={{ color: '#7F8C8D' }}>Aucune annulation n'est acceptée dans l'heure précédant la séance et entraîne des frais de <strong>50 %</strong> du coût de la séance.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl" style={{ color: '#2E5CA8' }}>•</span>
                  <span style={{ color: '#7F8C8D' }}>Une annulation effectuée dans ce délai ou une absence sans avis (« no-show ») entraîne la facturation complète de la séance.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 4. Absence sans avis */}
        <section className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{ backgroundColor: '#E74C3C' }}>
              4
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#2C3E50' }}>
                Absence sans avis
              </h2>
              <p className="leading-relaxed" style={{ color: '#7F8C8D' }}>
                Si l'élève ne se présente pas à la séance et qu'aucune communication n'a été reçue, la séance est automatiquement facturée à <strong>50 %</strong> du coût de la séance.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Annulation par le tuteur */}
        <section className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{ backgroundColor: '#E74C3C' }}>
              5
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#2C3E50' }}>
                Annulation par le tuteur
              </h2>
              <p className="leading-relaxed mb-4" style={{ color: '#7F8C8D' }}>
                Si un tuteur doit annuler une séance, celle-ci sera :
              </p>
              <ul className="space-y-2 pl-6">
                <li className="flex items-start gap-3">
                  <span className="text-xl" style={{ color: '#2E5CA8' }}>•</span>
                  <span style={{ color: '#7F8C8D' }}>reportée sans frais, ou</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl" style={{ color: '#2E5CA8' }}>•</span>
                  <span style={{ color: '#7F8C8D' }}>remplacée par un autre tuteur, selon la disponibilité et les préférences du parent.</span>
                </li>
              </ul>
              <p className="leading-relaxed mt-4" style={{ color: '#7F8C8D' }}>
                Aucun frais n'est facturé à la famille dans ce cas.
              </p>
            </div>
          </div>
        </section>

        {/* 6. Retards */}
        <section className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{ backgroundColor: '#E74C3C' }}>
              6
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#2C3E50' }}>
                Retards
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-xl" style={{ color: '#2E5CA8' }}>•</span>
                  <span style={{ color: '#7F8C8D' }}>La séance se termine à l'heure prévue, même en cas de retard de l'élève.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl" style={{ color: '#2E5CA8' }}>•</span>
                  <span style={{ color: '#7F8C8D' }}>Un retard de plus de 15 minutes sans avis peut être considéré comme une absence sans préavis et entraîner l'application des frais correspondants.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 7. Réservations prépayées ou forfaits */}
        <section className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{ backgroundColor: '#E74C3C' }}>
              7
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#2C3E50' }}>
                Réservations prépayées ou forfaits
              </h2>
              <p className="leading-relaxed" style={{ color: '#7F8C8D' }}>
                Les séances incluses dans un forfait ne sont pas remboursables, mais peuvent être reportées conformément à la présente politique d'annulation.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer
        onNavigateToHome={onBack}
        onNavigateToServices={onNavigateToServices}
        onNavigateToApproche={onNavigateToApproche}
        onNavigateToEquipe={onNavigateToEquipe}
        onNavigateToTermes={onNavigateToTermes}
        onNavigateToConfidentialite={onNavigateToConfidentialite}
        onNavigateToContact={onNavigateToContact}
      />
    </div>
  );
}