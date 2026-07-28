/**
 * Values shared by multiple presentation components.
 *
 * Keep deploy-time settings in environment variables (see `.env.example`),
 * and keep editorial facts in `facts.ts`.
 */
export const ELECTION_TIMELINE = {
  electionAt: '2024-07-28T10:00:00Z',
  totalizationDeadlineAt: '2024-07-30T10:00:00Z',
  gazetteDeadlineAt: '2024-08-27T10:00:00Z',
  totalizationProgressPercent: 2,
  gazetteProgressPercent: 5,
} as const;

export const CONTENT_LIMITS = {
  metaDescriptionCharacters: 155,
} as const;

export const EXTERNAL_LINKS = {
  resultadosConVzla: 'https://resultadosconvzla.com/',
  forOpenAL: 'https://foropenal.com/',
  lopre: 'https://pdba.georgetown.edu/Electoral/Venezuela/LOPE2009.pdf',
  cneArchive: 'https://web.archive.org/web/20240726002936/http://www.cne.gob.ve/',
  cneAuditProtocols: 'https://web.archive.org/web/20240417122253/http://www.cne.gob.ve/web/sistema_electoral/tecnologia_electoral_auditorias.php',
  iacHrResolution: 'https://www.oas.org/en/iachr/decisions/2024/VERE2401EN.PDF',
  euStatement: 'https://www.consilium.europa.eu/es/press/press-releases/2024/08/04/venezuela-statement-by-the-high-representative-on-behalf-of-the-eu/',
} as const;
