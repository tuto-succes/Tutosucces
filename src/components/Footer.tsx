import { Mail, Phone, Instagram, Facebook, Linkedin } from 'lucide-react';
import logoImg from 'figma:asset/bf7daf7f4d90880ea5fa593b28754dac8a736020.png';

interface FooterProps {
  onNavigateToHome?: () => void;
  onNavigateToServices?: () => void;
  onNavigateToApproche?: () => void;
  onNavigateToEquipe?: () => void;
  onNavigateToTermes?: () => void;
  onNavigateToConfidentialite?: () => void;
  onNavigateToAnnulation?: () => void;
  onNavigateToContact?: () => void;
}

export function Footer({
  onNavigateToHome,
  onNavigateToServices,
  onNavigateToApproche,
  onNavigateToEquipe,
  onNavigateToTermes,
  onNavigateToConfidentialite,
  onNavigateToAnnulation,
  onNavigateToContact,
}: FooterProps) {
  return (
    <footer className="text-gray-300 py-12" style={{ backgroundColor: '#2C3E50' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* À propos */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">À propos</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onNavigateToHome}
                  className="hover:text-white transition-colors text-left text-base"
                >
                  Accueil
                </button>
              </li>
              <li>
                <button
                  onClick={onNavigateToServices}
                  className="hover:text-white transition-colors text-left text-base"
                >
                  Nos services
                </button>
              </li>
              <li>
                <button
                  onClick={onNavigateToApproche}
                  className="hover:text-white transition-colors text-left text-base"
                >
                  Notre approche
                </button>
              </li>
              <li>
                <button
                  onClick={onNavigateToEquipe}
                  className="hover:text-white transition-colors text-left text-base"
                >
                  Notre équipe
                </button>
              </li>
            </ul>
          </div>

          {/* Nous contacter */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Nous contacter</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:tutosuccess4@gmail.com"
                  className="hover:text-white transition-colors flex items-center gap-2 text-base"
                >
                  <Mail size={18} style={{ color: '#E74C3C' }} />
                  tutosuccess4@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:514-651-2401"
                  className="hover:text-white transition-colors flex items-center gap-2 text-base"
                >
                  <Phone size={18} style={{ color: '#E74C3C' }} />
                  514-651-2401
                </a>
              </li>
              <li>
                <a
                  href="tel:514-562-2884"
                  className="hover:text-white transition-colors flex items-center gap-2 text-base"
                >
                  <Phone size={18} style={{ color: '#E74C3C' }} />
                  514-562-2884
                </a>
              </li>
            </ul>
          </div>

          {/* Mentions légales */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Mentions légales</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onNavigateToTermes}
                  className="hover:text-white transition-colors text-left text-base"
                >
                  Termes et conditions
                </button>
              </li>
              <li>
                <button
                  onClick={onNavigateToConfidentialite}
                  className="hover:text-white transition-colors text-left text-base"
                >
                  Politique de confidentialité
                </button>
              </li>
              <li>
                <button
                  onClick={onNavigateToAnnulation}
                  className="hover:text-white transition-colors text-left text-base"
                >
                  Politique d'annulation
                </button>
              </li>
            </ul>
          </div>

          {/* Nous suivre */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Nous suivre</h3>
            <div className="mb-4">
              <p className="text-white font-semibold mb-3 text-base">Tuto-Succès B&D</p>
              <div className="flex gap-4">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 pt-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={logoImg} alt="Logo Tuto-Succès B&D" className="h-16 opacity-80" />
          </div>

          {/* Citation */}
          <p className="text-center italic text-gray-400 mb-4">
            "L'effort, la persévérance et l'encadrement mènent à la réussite"
          </p>

          {/* Copyright */}
          <p className="text-center text-sm text-gray-500">
            © 2026 Tuto-Succès B&D. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}