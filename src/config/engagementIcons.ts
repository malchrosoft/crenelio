import type { Icon } from '@phosphor-icons/react';
import {
  CalendarCheckIcon,
  CertificateIcon,
  ChatCircleTextIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyEurIcon,
  BroomIcon,
  HandshakeIcon,
  LeafIcon,
  LightningIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldCheckIcon,
  StarIcon,
  WrenchIcon,
} from '@phosphor-icons/react';

export interface EngagementIcon {
  id: string;
  label: string;
  icon: Icon;
  /** Mots (minuscules) ou emojis déclenchant ce choix en mode automatique. */
  keywords: string[];
}

/**
 * Pictos proposés pour les engagements, dans l'ordre de détection automatique.
 * Couvre les engagements courants d'un artisan : ponctualité, garantie, devis, urgence, propreté…
 */
export const ENGAGEMENT_ICONS: EngagementIcon[] = [
  { id: 'clock', label: 'Ponctualité', icon: ClockIcon, keywords: ['ponctual', 'heure', 'temps', '🕐'] },
  { id: 'lightning', label: 'Rapidité / urgence', icon: LightningIcon, keywords: ['rapide', 'urgence', 'urgent', '24h', '⚡'] },
  { id: 'shield', label: 'Garantie', icon: ShieldCheckIcon, keywords: ['garanti', 'soigné', 'qualité', 'assur', '🛡️'] },
  { id: 'certificate', label: 'Qualification', icon: CertificateIcon, keywords: ['certifi', 'qualifi', 'agréé', 'rge', 'diplôm'] },
  { id: 'map-pin', label: 'À domicile', icon: MapPinIcon, keywords: ['domicile', 'intervention', 'zone', 'déplac', '📍'] },
  { id: 'chat', label: 'Devis / conseil', icon: ChatCircleTextIcon, keywords: ['devis', 'conseil', 'engagement', 'contact', '💬'] },
  { id: 'euro', label: 'Prix transparent', icon: CurrencyEurIcon, keywords: ['prix', 'tarif', 'transparen', '€', 'gratuit'] },
  { id: 'broom', label: 'Chantier propre', icon: BroomIcon, keywords: ['propre', 'nettoy', 'propreté'] },
  { id: 'wrench', label: 'Matériel / pièces', icon: WrenchIcon, keywords: ['matériel', 'pièce', 'outil', 'équipement', 'répar'] },
  { id: 'calendar', label: 'Disponibilité', icon: CalendarCheckIcon, keywords: ['disponib', '7j', '7/7', 'week-end', 'samedi'] },
  { id: 'phone', label: 'Joignable', icon: PhoneIcon, keywords: ['joignable', 'téléphone', 'appel', 'réponse'] },
  { id: 'leaf', label: 'Écologie', icon: LeafIcon, keywords: ['écolo', 'environnement', 'recycl', 'énergie', 'économ'] },
  { id: 'handshake', label: 'Confiance', icon: HandshakeIcon, keywords: ['confiance', 'proximité', 'local', 'honnête'] },
  { id: 'star', label: 'Satisfaction', icon: StarIcon, keywords: ['satisf', 'avis', 'recommand', 'client'] },
  { id: 'check', label: 'Générique', icon: CheckCircleIcon, keywords: [] },
];

const DEFAULT_ICON = ENGAGEMENT_ICONS[ENGAGEMENT_ICONS.length - 1];

/** Picto choisi (`vitrine_engagement_N_icon`), sinon déduit du texte, sinon générique. */
export function resolveEngagementIcon(text: string, iconId?: string | null): EngagementIcon {
  const chosen = iconId ? ENGAGEMENT_ICONS.find((i) => i.id === iconId) : undefined;
  if (chosen) return chosen;
  const lower = text.toLowerCase();
  return ENGAGEMENT_ICONS.find((i) => i.keywords.some((k) => lower.includes(k))) ?? DEFAULT_ICON;
}

/** Libellé sans l'emoji de tête (ancien format « 🕐 Ponctualité garantie »). */
export const stripLeadingEmoji = (text: string) =>
  text.replace(/^(\p{Emoji_Presentation}|\p{Emoji}️|\p{Emoji_Modifier_Base}|\p{Emoji})+\s*/u, '').trim();
