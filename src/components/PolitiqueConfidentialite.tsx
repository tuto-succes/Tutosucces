import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Footer } from './Footer';
import logoImg from 'figma:asset/bf7daf7f4d90880ea5fa593b28754dac8a736020.png';

interface PolitiqueConfidentialiteProps {
  onBack: () => void;
  onNavigateToServices?: () => void;
  onNavigateToApproche?: () => void;
  onNavigateToEquipe?: () => void;
  onNavigateToTermes?: () => void;
  onNavigateToAnnulation?: () => void;
  onNavigateToContact?: () => void;
}

export function PolitiqueConfidentialite({ onBack, onNavigateToServices, onNavigateToApproche, onNavigateToEquipe, onNavigateToTermes, onNavigateToAnnulation, onNavigateToContact }: PolitiqueConfidentialiteProps) {
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

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-5xl font-bold text-center mb-8" style={{ color: '#2C3E50' }}>
          Politique de confidentialité
        </h1>
        <div className="w-24 h-1 mx-auto mb-16" style={{ backgroundColor: '#E74C3C' }}></div>

        {/* Préambule */}
        <section className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-3xl font-bold mb-6" style={{ color: '#E74C3C' }}>
            Préambule
          </h2>
          <p className="mb-4 leading-relaxed" style={{ color: '#7F8C8D' }}>
            La protection des renseignements personnels des élèves, parents, tuteurs et visiteurs de nos plateformes constitue une priorité pour Tuto-Succès B&D.
          </p>
          <p className="mb-6 leading-relaxed" style={{ color: '#7F8C8D' }}>
            Nous nous engageons à assurer la confidentialité, la sécurité et l'utilisation responsable des données qui nous sont confiées dans le cadre de nos services de tutorat et de soutien scolaire.
          </p>

          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-3">
              <span className="text-2xl" style={{ color: '#E74C3C' }}>•</span>
              <span style={{ color: '#7F8C8D' }}>Nous ne collectons que les renseignements nécessaires à des fins éducatives, administratives ou de communication.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl" style={{ color: '#E74C3C' }}>•</span>
              <span style={{ color: '#7F8C8D' }}>Nous ne vendons jamais les renseignements personnels à des tiers.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl" style={{ color: '#E74C3C' }}>•</span>
              <span style={{ color: '#7F8C8D' }}>Nous n'utilisons pas les renseignements des élèves à des fins de publicité ciblée.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl" style={{ color: '#E74C3C' }}>•</span>
              <span style={{ color: '#7F8C8D' }}>Nous conservons les données uniquement pour la durée requise aux fins prévues.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl" style={{ color: '#E74C3C' }}>•</span>
              <span style={{ color: '#7F8C8D' }}>Nous appliquons les normes de sécurité conformes aux lois du Québec, incluant la Loi 25.</span>
            </li>
          </ul>

          <p className="mt-6 leading-relaxed" style={{ color: '#7F8C8D' }}>
            Pour toute question ou demande liée à la vie privée :<br />
            <a href="mailto:tutosuccesbd@gmail.com" className="font-semibold hover:underline" style={{ color: '#2E5CA8' }}>
              tutosuccesbd@gmail.com
            </a>
          </p>
        </section>

        {/* Renseignements personnels recueillis */}
        <section className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-3xl font-bold mb-6" style={{ color: '#E74C3C' }}>
            Renseignements personnels recueillis
          </h2>

          {/* Parent ou responsable */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4" style={{ color: '#2C3E50' }}>
              A) Parent ou responsable
            </h3>
            <ul className="space-y-2 pl-6">
              <li className="flex items-start gap-3">
                <span className="text-xl" style={{ color: '#2E5CA8' }}>•</span>
                <span style={{ color: '#7F8C8D' }}>Nom et prénom</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl" style={{ color: '#2E5CA8' }}>•</span>
                <span style={{ color: '#7F8C8D' }}>Adresse courriel</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl" style={{ color: '#2E5CA8' }}>•</span>
                <span style={{ color: '#7F8C8D' }}>Numéro de téléphone</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl" style={{ color: '#2E5CA8' }}>•</span>
                <span style={{ color: '#7F8C8D' }}>Adresse civique (si facturation)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl" style={{ color: '#2E5CA8' }}>•</span>
                <span style={{ color: '#7F8C8D' }}>Informations de facturation</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl" style={{ color: '#2E5CA8' }}>•</span>
                <span style={{ color: '#7F8C8D' }}>Préférences liées aux services</span>
              </li>
            </ul>
          </div>

          {/* Élève */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4" style={{ color: '#2C3E50' }}>
              B) Élève
            </h3>
            <ul className="space-y-2 pl-6">
              <li className="flex items-start gap-3">
                <span className="text-xl" style={{ color: '#2E5CA8' }}>•</span>
                <span style={{ color: '#7F8C8D' }}>Nom et prénom</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl" style={{ color: '#2E5CA8' }}>•</span>
                <span style={{ color: '#7F8C8D' }}>Niveau scolaire</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl" style={{ color: '#2E5CA8' }}>•</span>
                <span style={{ color: '#7F8C8D' }}>École fréquentée</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl" style={{ color: '#2E5CA8' }}>•</span>
                <span style={{ color: '#7F8C8D' }}>Historique des séances et progrès</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl" style={{ color: '#2E5CA8' }}>•</span>
                <span style={{ color: '#7F8C8D' }}>Besoins éducatifs</span>
              </li>
            </ul>
          </div>

          {/* Tuteurs */}
          <div>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#2C3E50' }}>
              C) Tuteurs
            </h3>
            <ul className="space-y-2 pl-6">
              <li className="flex items-start gap-3">
                <span className="text-xl" style={{ color: '#2E5CA8' }}>•</span>
                <span style={{ color: '#7F8C8D' }}>Coordonnées professionnelles</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl" style={{ color: '#2E5CA8' }}>•</span>
                <span style={{ color: '#7F8C8D' }}>Matières enseignées</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl" style={{ color: '#2E5CA8' }}>•</span>
                <span style={{ color: '#7F8C8D' }}>Disponibilités</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Sécurité et conservation */}
        <section className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-3xl font-bold mb-6" style={{ color: '#E74C3C' }}>
            Sécurité et conservation
          </h2>
          <p className="leading-relaxed" style={{ color: '#7F8C8D' }}>
            Les renseignements sont conservés uniquement pour la durée nécessaire à la prestation des services et détruits de façon sécuritaire lorsque requis.
          </p>
        </section>

        {/* Vos droits */}
        <section className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold mb-6" style={{ color: '#E74C3C' }}>
            Vos droits
          </h2>
          <p className="leading-relaxed" style={{ color: '#7F8C8D' }}>
            Vous pouvez demander l'accès, la rectification ou la suppression de vos renseignements personnels en écrivant à :
          </p>
          <p className="mt-4">
            <a href="mailto:tutosuccesbd@gmail.com" className="text-lg font-semibold hover:underline" style={{ color: '#2E5CA8' }}>
              tutosuccesbd@gmail.com
            </a>
          </p>
        </section>
      </div>

      {/* Footer */}
      <Footer
        onNavigateToHome={onBack}
        onNavigateToServices={onNavigateToServices}
        onNavigateToApproche={onNavigateToApproche}
        onNavigateToEquipe={onNavigateToEquipe}
        onNavigateToTermes={onNavigateToTermes}
        onNavigateToAnnulation={onNavigateToAnnulation}
        onNavigateToContact={onNavigateToContact}
      />
    </div>
  );
}