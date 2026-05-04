import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Footer } from './Footer';
import logoImg from 'figma:asset/bf7daf7f4d90880ea5fa593b28754dac8a736020.png';

interface NotreEquipeProps {
  onBack: () => void;
  onNavigateToRegistration?: () => void;
  onNavigateToServices?: () => void;
  onNavigateToApproche?: () => void;
  onNavigateToTermes?: () => void;
  onNavigateToConfidentialite?: () => void;
  onNavigateToAnnulation?: () => void;
  onNavigateToContact?: () => void;
}

// Données des tuteurs
const tutors = [
  {
    id: 1,
    name: 'Sophie Martin',
    photo: 'https://images.unsplash.com/photo-1758685848208-e108b6af94cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjB0ZWFjaGVyJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc2Nzg5OTEyM3ww&ixlib=rb-4.1.0&q=80&w=1080',
    experience: '8 ans d\'expérience',
    subjects: ['Mathématiques', 'Physique', 'Chimie'],
  },
  {
    id: 2,
    name: 'David Tremblay',
    photo: 'https://images.unsplash.com/photo-1584554376766-ac0f2c65e949?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIwdGVhY2hlciUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3Njc4OTkxMjN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    experience: '6 ans d\'expérience',
    subjects: ['Français', 'Littérature', 'Philosophie'],
  },
  {
    id: 3,
    name: 'Marie Dubois',
    photo: 'https://images.unsplash.com/photo-1758525860449-fa3602fceb31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHR1dG9yJTIwdGVhY2hpbmd8ZW58MXx8fHwxNzY3ODk5MTI0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    experience: '5 ans d\'expérience',
    subjects: ['Anglais', 'Espagnol', 'Communication'],
  },
  {
    id: 4,
    name: 'Jean-François Roy',
    photo: 'https://images.unsplash.com/photo-1758270704296-a59b8f4e7dda?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzb3IlMjBlZHVjYXRvcnxlbnwxfHx8fDE3Njc4OTkxMjR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    experience: '10 ans d\'expérience',
    subjects: ['Histoire', 'Géographie', 'Sciences Sociales'],
  },
  {
    id: 5,
    name: 'Isabelle Gagnon',
    photo: 'https://images.unsplash.com/photo-1543430720-fa600c67e423?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFjaGVyJTIwc21pbGluZyUyMHBvcnRyYWl0fGVufDF8fHx8MTc2Nzg5OTEyNXww&ixlib=rb-4.1.0&q=80&w=1080',
    experience: '7 ans d\'expérience',
    subjects: ['Biologie', 'Sciences Naturelles', 'Environnement'],
  },
  {
    id: 6,
    name: 'Marc Lefebvre',
    photo: 'https://images.unsplash.com/photo-1659355751209-2e6c7c8091fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0dXRvciUyMHByb2Zlc3Npb25hbCUyMGhlYWRzaG90fGVufDF8fHx8MTc2Nzg5OTEyNnww&ixlib=rb-4.1.0&q=80&w=1080',
    experience: '9 ans d\'expérience',
    subjects: ['Informatique', 'Programmation', 'Technologies'],
  },
];

export function NotreEquipe({ onBack, onNavigateToRegistration, onNavigateToServices, onNavigateToApproche, onNavigateToTermes, onNavigateToConfidentialite, onNavigateToAnnulation, onNavigateToContact }: NotreEquipeProps) {
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
            Notre Équipe
          </h1>
          <p className="text-xl text-white opacity-90">
            Une équipe de tuteurs passionnés, à l'écoute, et certifiés vous accompagne vers l'excellence scolaire et une identité de foi solide
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Introduction */}
        <section className="bg-white rounded-2xl p-8 shadow-lg mb-12 text-center">
          <p className="text-lg leading-relaxed" style={{ color: '#7F8C8D' }}>
            Nous sélectionnons avec soin des tuteurs passionnés, qualifiés et dévoués à la réussite de chaque élève. 
            Chaque accompagnement est adapté au profil et aux objectifs de l'élève.
          </p>
        </section>

        {/* Grille de tuteurs */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-10" style={{ color: '#E74C3C' }}>
            Nos Tuteurs Experts
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tutors.map((tutor) => (
              <div 
                key={tutor.id}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                {/* Photo */}
                <div className="mb-6">
                  <img
                    src={tutor.photo}
                    alt={tutor.name}
                    className="w-32 h-32 rounded-full mx-auto object-cover border-4"
                    style={{ borderColor: '#E74C3C' }}
                  />
                </div>

                {/* Nom */}
                <h3 className="text-xl font-bold text-center mb-2" style={{ color: '#2C3E50' }}>
                  {tutor.name}
                </h3>

                {/* Expérience */}
                <p className="text-center mb-4" style={{ color: '#7F8C8D' }}>
                  {tutor.experience}
                </p>

                {/* Matières enseignées */}
                <div className="mb-6">
                  <p className="text-sm font-semibold mb-2 text-center" style={{ color: '#2E5CA8' }}>
                    Matières enseignées :
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {tutor.subjects.map((subject, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: '#F8F9FA', color: '#2C3E50' }}
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bouton */}
                <Button
                  className="w-full rounded-lg font-semibold"
                  style={{ backgroundColor: '#E74C3C', color: '#FFFFFF' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#C0392B'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#E74C3C'}
                  onClick={onNavigateToRegistration}
                >
                  Trouver un tuteur
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Valeurs de l'équipe */}
        <section className="bg-white rounded-2xl p-10 shadow-lg mb-12">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: '#E74C3C' }}>
            Nos valeurs
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#FCE4EC' }}>
                <span className="text-3xl font-bold" style={{ color: '#E74C3C' }}>1</span>
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#2C3E50' }}>
                Excellence académique
              </h3>
              <p style={{ color: '#7F8C8D' }}>
                Nos tuteurs sont sélectionnés pour leur expertise dans leur domaine et leur capacité à transmettre leurs connaissances.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#E3F2FD' }}>
                <span className="text-3xl font-bold" style={{ color: '#2E5CA8' }}>2</span>
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#2C3E50' }}>
                Passion pour l'enseignement
              </h3>
              <p style={{ color: '#7F8C8D' }}>
                Chaque membre de notre équipe est animé par la volonté d'inspirer et de guider les élèves vers la réussite.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#FCE4EC' }}>
                <span className="text-3xl font-bold" style={{ color: '#E74C3C' }}>3</span>
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#2C3E50' }}>
                Bienveillance et écoute
              </h3>
              <p style={{ color: '#7F8C8D' }}>
                Nous créons un environnement d'apprentissage positif où chaque élève se sent écouté, soutenu et encouragé.
              </p>
            </div>
          </div>
        </section>

        {/* Processus de sélection */}
        <section className="bg-white rounded-2xl p-10 shadow-lg mb-12">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: '#E74C3C' }}>
            Notre processus de sélection
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#2E5CA8' }}>
                ✓
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2" style={{ color: '#2C3E50' }}>
                  Vérification des qualifications académiques
                </h3>
                <p style={{ color: '#7F8C8D' }}>
                  Tous nos tuteurs possèdent un diplôme reconnu dans leur domaine d'expertise.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#2E5CA8' }}>
                ✓
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2" style={{ color: '#2C3E50' }}>
                  Évaluation des compétences pédagogiques
                </h3>
                <p style={{ color: '#7F8C8D' }}>
                  Nous testons leur capacité à expliquer clairement et à s'adapter aux différents styles d'apprentissage.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#2E5CA8' }}>
                ✓
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2" style={{ color: '#2C3E50' }}>
                  Entretien approfondi
                </h3>
                <p style={{ color: '#7F8C8D' }}>
                  Chaque candidat passe un entretien pour s'assurer qu'il partage nos valeurs et notre approche pédagogique.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#2E5CA8' }}>
                ✓
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2" style={{ color: '#2C3E50' }}>
                  Formation continue
                </h3>
                <p style={{ color: '#7F8C8D' }}>
                  Nos tuteurs bénéficient de formations régulières pour rester à jour sur les meilleures pratiques pédagogiques.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl p-12 text-center" style={{ background: 'linear-gradient(135deg, #E74C3C 0%, #2E5CA8 100%)' }}>
          <h2 className="text-3xl font-bold text-white mb-4">
            Rejoignez notre équipe
          </h2>
          <p className="text-white text-lg mb-6 opacity-90">
            Vous êtes passionné par l'enseignement et souhaitez faire une différence dans la vie des élèves ?
          </p>
          <Button
            size="lg"
            className="px-10 py-6 text-lg rounded-lg shadow-lg"
            style={{ backgroundColor: '#FFFFFF', color: '#E74C3C' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8F9FA'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
            onClick={onNavigateToRegistration}
          >
            Postuler comme tuteur
          </Button>
        </section>
      </div>

      {/* Footer */}
      <Footer
        onNavigateToHome={onBack}
        onNavigateToServices={onNavigateToServices}
        onNavigateToApproche={onNavigateToApproche}
        onNavigateToEquipe={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onNavigateToTermes={onNavigateToTermes}
        onNavigateToConfidentialite={onNavigateToConfidentialite}
        onNavigateToAnnulation={onNavigateToAnnulation}
        onNavigateToContact={onNavigateToContact}
      />
    </div>
  );
}