import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Footer } from './Footer';
import logoImg from 'figma:asset/bf7daf7f4d90880ea5fa593b28754dac8a736020.png';

interface TermesConditionsProps {
  onBack: () => void;
  onNavigateToServices?: () => void;
  onNavigateToApproche?: () => void;
  onNavigateToEquipe?: () => void;
  onNavigateToConfidentialite?: () => void;
  onNavigateToAnnulation?: () => void;
  onNavigateToContact?: () => void;
}

export function TermesConditions({ onBack, onNavigateToServices, onNavigateToApproche, onNavigateToEquipe, onNavigateToConfidentialite, onNavigateToAnnulation, onNavigateToContact }: TermesConditionsProps) {
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

      {/* Hero Section */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, #E74C3C 0%, #2E5CA8 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Termes & Conditions
          </h1>
          <p className="text-xl text-white opacity-90">
            Conditions d'utilisation de nos services et de notre plateforme
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Introduction et consentement */}
        <section className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#E74C3C' }}>
            Introduction et consentement
          </h2>
          <p className="leading-relaxed" style={{ color: '#7F8C8D' }}>
            En accédant aux plateformes, services ou contenus offerts par Tuto-Succès B&D, vous reconnaissez avoir lu, compris et accepté les présents Termes et conditions, et vous engagez à vous y conformer. Tuto-Succès B&D se réserve le droit de modifier les Termes et conditions en tout temps, sans avis préalable. L'utilisation continue de nos services constitue votre acceptation des versions les plus récentes.
          </p>
        </section>

        {/* Mission */}
        <section className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#E74C3C' }}>
            Mission de Tuto-Succès B&D
          </h2>
          <p className="leading-relaxed mb-4" style={{ color: '#7F8C8D' }}>
            Tuto-Succès B&D est une entreprise spécialisée dans le tutorat personnalisé, le soutien scolaire et l'accompagnement éducatif des élèves du primaire, du secondaire, du cégep et des cours préparatoires. Notre plateforme permet aux élèves, parents et tuteurs de réserver des séances, de suivre la progression et de communiquer dans un cadre structuré, professionnel et sécuritaire.
          </p>
          <h3 className="font-bold mb-3" style={{ color: '#2C3E50' }}>
            Nos services incluent notamment :
          </h3>
          <ul className="list-disc pl-6 space-y-2" style={{ color: '#7F8C8D' }}>
            <li>des séances de tutorat en ligne ou en personne;</li>
            <li>des rapports de progression et résumés de séance;</li>
            <li>un portail en ligne pour le suivi éducatif;</li>
            <li>une plateforme de facturation et de paiement des séances complétées.</li>
          </ul>
        </section>

        {/* Droits d'utilisation */}
        <section className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#E74C3C' }}>
            Droits d'utilisation de la plateforme
          </h2>
          <p className="leading-relaxed mb-4" style={{ color: '#7F8C8D' }}>
            L'utilisateur est autorisé à naviguer sur les plateformes de Tuto-Succès B&D et à utiliser les services dans le respect des présents Termes et conditions.
          </p>
          <p className="leading-relaxed mb-3" style={{ color: '#7F8C8D' }}>
            Tuto-Succès B&D peut, à son entière discrétion :
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4" style={{ color: '#7F8C8D' }}>
            <li>suspendre ou restreindre l'accès à tout compte en cas d'utilisation non conforme;</li>
            <li>limiter l'accès à certaines fonctionnalités;</li>
            <li>retirer temporairement ou de façon permanente du contenu ou des services sans avis préalable.</li>
          </ul>
          <p className="leading-relaxed" style={{ color: '#7F8C8D' }}>
            Toute utilisation contraire aux lois du Québec ou du Canada, ou visant à porter atteinte à la plateforme, peut entraîner des mesures disciplinaires ou des recours juridiques.
          </p>
        </section>

        {/* Propriété intellectuelle */}
        <section className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#E74C3C' }}>
            Propriété intellectuelle
          </h2>
          <p className="leading-relaxed mb-4" style={{ color: '#7F8C8D' }}>
            Sauf indication contraire, Tuto-Succès B&D détient l'ensemble des droits de propriété intellectuelle liés à ses plateformes, contenus et services.
          </p>
          <p className="leading-relaxed mb-3" style={{ color: '#7F8C8D' }}>
            Cela inclut, sans s'y limiter :
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4" style={{ color: '#7F8C8D' }}>
            <li>les textes, outils pédagogiques et documents PDF;</li>
            <li>les images, logos, vidéos, illustrations et visuels;</li>
            <li>le matériel promotionnel;</li>
            <li>la structure du site, ses modules et fonctionnalités;</li>
            <li>les modèles de rapports, factures et communications;</li>
            <li>les logiciels, codes source et éléments de programmation.</li>
          </ul>
          <p className="leading-relaxed mb-3" style={{ color: '#7F8C8D' }}>
            L'utilisateur ne peut, sans autorisation écrite de Tuto-Succès B&D :
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4" style={{ color: '#7F8C8D' }}>
            <li>reproduire, diffuser, distribuer ou publier nos contenus;</li>
            <li>copier ou extraire des éléments du site;</li>
            <li>intégrer nos documents ou outils dans des plateformes tierces;</li>
            <li>revendre ou exploiter commercialement nos services ou ressources.</li>
          </ul>
          <p className="leading-relaxed" style={{ color: '#7F8C8D' }}>
            Un usage personnel, privé et limité est permis tant que les droits de propriété intellectuelle sont entièrement respectés.
          </p>
        </section>

        {/* Accès aux plateformes */}
        <section className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#E74C3C' }}>
            Accès aux plateformes et continuité de service
          </h2>
          <p className="leading-relaxed mb-4" style={{ color: '#7F8C8D' }}>
            Tuto-Succès B&D s'engage à offrir des services fiables, sécuritaires et fonctionnels. Toutefois, nous ne pouvons garantir une disponibilité continue et ininterrompue.
          </p>
          <p className="leading-relaxed mb-3" style={{ color: '#7F8C8D' }}>
            Tuto-Succès B&D peut, sans préavis :
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4" style={{ color: '#7F8C8D' }}>
            <li>effectuer des mises à jour ou des maintenances techniques;</li>
            <li>suspendre temporairement ou définitivement certaines fonctionnalités;</li>
            <li>modifier l'accès à certaines sections de la plateforme.</li>
          </ul>
          <p className="leading-relaxed" style={{ color: '#7F8C8D' }}>
            Aucun dédommagement ne pourra être exigé pour des interruptions de service attribuables à des raisons techniques, de maintenance, de sécurité ou de force majeure.
          </p>
        </section>

        {/* Utilisation acceptable */}
        <section className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#E74C3C' }}>
            Utilisation acceptable
          </h2>
          <p className="leading-relaxed mb-3" style={{ color: '#7F8C8D' }}>
            En utilisant la plateforme, vous vous engagez à :
          </p>
          <ul className="list-disc pl-6 space-y-2" style={{ color: '#7F8C8D' }}>
            <li>respecter les présents Termes et conditions;</li>
            <li>fournir des informations exactes et à jour;</li>
            <li>utiliser la plateforme dans un cadre légal, respectueux et sécuritaire;</li>
            <li>protéger la confidentialité de vos identifiants;</li>
            <li>aviser rapidement Tuto-Succès B&D de toute utilisation suspecte de votre compte.</li>
          </ul>
        </section>

        {/* Comportements interdits */}
        <section className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#E74C3C' }}>
            Comportements interdits
          </h2>
          <p className="leading-relaxed mb-3" style={{ color: '#7F8C8D' }}>
            Il est strictement interdit de :
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4" style={{ color: '#7F8C8D' }}>
            <li>accéder ou tenter d'accéder à un compte ou à des informations qui ne vous appartiennent pas;</li>
            <li>utiliser les services à des fins frauduleuses ou illégitimes;</li>
            <li>tenter d'obtenir les identifiants, mots de passe ou informations personnelles d'autres utilisateurs;</li>
            <li>modifier, contourner, désactiver ou compromettre la sécurité de la plateforme;</li>
            <li>télécharger, transmettre ou insérer des virus, logiciels malveillants, scripts ou mécanismes dommageables;</li>
            <li>envoyer des messages non sollicités (spam) ou des contenus abusifs, diffamatoires, menaçants, harcelants ou inappropriés;</li>
            <li>utiliser la plateforme dans un but commercial autre que celui autorisé par Tuto-Succès B&D;</li>
            <li>contrevenir, intentionnellement ou non, à une loi municipale, provinciale, fédérale ou internationale.</li>
          </ul>
          <p className="leading-relaxed mb-3" style={{ color: '#7F8C8D' }}>
            Toute infraction peut entraîner :
          </p>
          <ul className="list-disc pl-6 space-y-2" style={{ color: '#7F8C8D' }}>
            <li>la suspension ou la fermeture du compte;</li>
            <li>l'interdiction d'utiliser les services;</li>
            <li>des recours civils ou criminels.</li>
          </ul>
        </section>

        {/* Responsabilités */}
        <section className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#E74C3C' }}>
            Responsabilités
          </h2>
          
          <h3 className="text-lg font-bold mb-3" style={{ color: '#2E5CA8' }}>
            Responsabilités de l'utilisateur
          </h3>
          <ul className="list-disc pl-6 space-y-2 mb-6" style={{ color: '#7F8C8D' }}>
            <li>de l'exactitude des renseignements fournis;</li>
            <li>du respect des politiques de paiement, d'annulation et de facturation;</li>
            <li>du bon usage de la plateforme;</li>
            <li>de la confidentialité de ses identifiants.</li>
          </ul>

          <h3 className="text-lg font-bold mb-3" style={{ color: '#2E5CA8' }}>
            Responsabilités de Tuto-Succès B&D
          </h3>
          <p className="leading-relaxed mb-4" style={{ color: '#7F8C8D' }}>
            Tuto-Succès B&D met en place des mesures de sécurité raisonnables, protège les données des utilisateurs conformément aux lois applicables au Québec et au Canada, et fournit un environnement pédagogique professionnel et encadré.
          </p>
          <p className="leading-relaxed mb-3" style={{ color: '#7F8C8D' }}>
            Tuto-Succès B&D ne peut être tenue responsable :
          </p>
          <ul className="list-disc pl-6 space-y-2" style={{ color: '#7F8C8D' }}>
            <li>de l'utilisation inadéquate de la plateforme par l'utilisateur;</li>
            <li>des interruptions de service hors de son contrôle;</li>
            <li>des actes malveillants provenant de tiers;</li>
            <li>des retards, erreurs ou omissions provenant des utilisateurs.</li>
          </ul>
        </section>

        {/* Sécurité et confidentialité */}
        <section className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#E74C3C' }}>
            Sécurité et confidentialité
          </h2>
          <p className="leading-relaxed mb-4" style={{ color: '#7F8C8D' }}>
            Toute tentative d'accès non autorisé, de piratage, d'extraction de données ou d'atteinte à la sécurité est strictement interdite et peut mener à des actions légales.
          </p>
          <p className="leading-relaxed" style={{ color: '#7F8C8D' }}>
            Pour toute question ou problème d'accès à la plateforme : <a href="mailto:tutosuccesbd@gmail.com" className="underline" style={{ color: '#2E5CA8' }}>tutosuccesbd@gmail.com</a>
          </p>
        </section>

        {/* Paiements */}
        <section className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#E74C3C' }}>
            Paiements, réservations et politiques financières
          </h2>
          <p className="leading-relaxed mb-3" style={{ color: '#7F8C8D' }}>
            En utilisant les services de Tuto-Succès B&D, vous acceptez que :
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4" style={{ color: '#7F8C8D' }}>
            <li>les séances soient payées selon le modèle de facturation en vigueur;</li>
            <li>les paiements puissent être effectués par Visa, Mastercard ou Interac;</li>
            <li>une facture soit générée automatiquement après les séances complétées;</li>
            <li>les politiques d'annulation et de reprogrammation soient respectées;</li>
            <li>tout solde impayé puisse entraîner une suspension temporaire des séances.</li>
          </ul>
          <p className="leading-relaxed" style={{ color: '#7F8C8D' }}>
            L'utilisateur est responsable de vérifier la validité de ses informations de paiement.
          </p>
        </section>

        {/* Résiliation */}
        <section className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#E74C3C' }}>
            Résiliation de services
          </h2>
          <p className="leading-relaxed" style={{ color: '#7F8C8D' }}>
            Tuto-Succès B&D se réserve le droit de mettre fin à l'accès d'un utilisateur en cas de comportement inadmissible, d'utilisation frauduleuse, de non-paiement répété ou de non-respect des présents Termes et conditions.
          </p>
        </section>

        {/* Droit applicable */}
        <section className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#E74C3C' }}>
            Droit applicable
          </h2>
          <p className="leading-relaxed" style={{ color: '#7F8C8D' }}>
            Les présents Termes et conditions sont régis par les lois de la province de Québec et les lois fédérales applicables au Canada. Tout litige sera porté devant les tribunaux compétents du district judiciaire où Tuto-Succès B&D exerce ses activités.
          </p>
        </section>

      </div>

      {/* Footer */}
      <Footer
        onNavigateToHome={onBack}
        onNavigateToServices={onNavigateToServices}
        onNavigateToApproche={onNavigateToApproche}
        onNavigateToEquipe={onNavigateToEquipe}
        onNavigateToConfidentialite={onNavigateToConfidentialite}
        onNavigateToAnnulation={onNavigateToAnnulation}
        onNavigateToContact={onNavigateToContact}
      />
    </div>
  );
}