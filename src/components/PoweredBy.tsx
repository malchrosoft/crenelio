import React from 'react';
import { GithubLogoIcon } from '@phosphor-icons/react';

/**
 * « Powered by Crénelio », lien vers le code source (AGPL-3.0, art. 13 : accès au code source pour les
 * utilisateurs en ligne d'une version modifiée). Pied de page de la vitrine et pages en ligne du devis ;
 * jamais sur les documents (PDF, version imprimable, emails), qui restent ceux du professionnel.
 */
const PoweredBy: React.FC = () => (
  <span className="footer-bottom__powered">
    Powered by{' '}
    <a href="https://github.com/malchrosoft/crenelio" target="_blank" rel="noopener noreferrer" className="footer-bottom__project-link">
      <GithubLogoIcon size={14} weight="fill" aria-hidden="true" />
      Crénelio
    </a>
    <span className="footer-bottom__slogan">— Book appointments directly with your local pro</span>
  </span>
);

export default PoweredBy;
