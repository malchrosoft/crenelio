/**
 * Identité légale de l'entreprise sur les devis et leurs documents (Item 22) :
 * « Nom – EI » (C. com. R526-27) ou « Raison sociale, SARL au capital de … » (CAPITAL_FORMS).
 * Fiche : docs/legal/fr/mentions-entreprise.md.
 */
import { AppConfig } from '../types';
import { CAPITAL_FORMS } from '../config/configSchema';
import { euro } from '../components/admin/quoteRules';

export function legalIdentity(config: AppConfig): string {
  const form = config.legal_form || 'ei';
  if (form === 'ei') {
    return `${config.pro_name || config.company_name || ''} – ${config.legal_ei_mention || 'EI'}`;
  }
  const name = config.legal_raison_sociale || config.company_name || '';
  const capital = CAPITAL_FORMS.includes(form) && config.legal_capital ? ` au capital de ${euro(config.legal_capital)}` : '';
  return `${name}, ${form}${capital}`;
}

/** Adresse de l'entreprise : siège (mentions légales), sinon adresse des locaux. */
export function companyAddress(config: AppConfig): string {
  return (
    config.legal_adresse ||
    [config.premises_address, `${config.premises_postal_code ?? ''} ${config.premises_city ?? ''}`.trim()].filter(Boolean).join(', ')
  );
}
