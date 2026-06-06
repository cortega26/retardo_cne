export const FACTS = {
  /** Citizen tally sheets digitized — ResultadosConVzla, Jan 3 2025 */
  citizenActas: 25575,
  citizenActasEs: '25.575',
  citizenActasEn: '25,575',
  citizenActasPct: 85,

  /** Total voting tables (mesas) in Venezuela */
  totalMesas: 30026,
  totalMesasEs: '30.026',
  totalMesasEn: '30,026',

  /** Official CNE per-table results published */
  officialActas: 0,

  /** Primary official/legal documents linked in the observatory */
  primaryDocsCount: 10,

  /** ISO date — update when a new general verification sweep is done */
  lastVerified: '2026-06-06',

  /** Art. 155 LOPRE 30-day Gazette deadline (election Jul 28 + 30 days) */
  gazetaDeadline: '2024-08-29',

  /** Carter Center formal letter requesting per-table breakdown */
  carterLetterDate: '2024-08-17',
} as const;
