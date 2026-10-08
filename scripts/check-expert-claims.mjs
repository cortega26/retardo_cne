import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(root, 'src/data/expert-claims.json');
const expectedIds = new Set([
  'tao-cne-first-bulletin',
  'gelman-cne-first-bulletin',
  'kronick-opposition-actas',
  'mebane-opposition-actas',
]);
const expectedSourceUrls = {
  'tao-cne-first-bulletin': 'https://terrytao.wordpress.com/2024/08/02/what-are-the-odds-ii-the-venezuelan-presidential-election/',
  'gelman-cne-first-bulletin': 'https://statmodeling.stat.columbia.edu/2024/07/31/suspicious-data-pattern-in-recent-venezuelan-election/',
  'kronick-opposition-actas': 'https://dorothykronick.com/28J.pdf',
  'mebane-opposition-actas': 'https://websites.umich.edu/~wmebane/Venezuela2024.pdf',
};
const renderedComponents = [
  'src/components/Anomaly.astro',
  'src/components/Existence.astro',
  'src/components/Analysis.astro',
];
const requiredStringFields = ['id', 'group', 'name', 'method', 'caveat'];

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function bilingual(value) {
  return value && nonEmptyString(value.es) && nonEmptyString(value.en);
}

function fail(message) {
  console.error(`Expert-claim guardrail: ${message}`);
  process.exitCode = 1;
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
if (!Array.isArray(manifest.claims) || manifest.claims.length !== expectedIds.size) {
  fail(`expected exactly ${expectedIds.size} reviewed claims.`);
} else {
  const seenIds = new Set();
  for (const claim of manifest.claims) {
    for (const field of requiredStringFields) {
      if (field === 'method' || field === 'caveat') {
        if (!bilingual(claim[field])) fail(`${claim.id ?? 'unknown'}: ${field} must be bilingual.`);
      } else if (!nonEmptyString(claim[field])) {
        fail(`${claim.id ?? 'unknown'}: ${field} is required.`);
      }
    }
    if (!bilingual(claim.affiliation) || !bilingual(claim.date) || !bilingual(claim.finding)) {
      fail(`${claim.id ?? 'unknown'}: affiliation, date, and finding must be bilingual.`);
    }
    if (!claim.source || !['title', 'url', 'locator', 'supports', 'retrievedAt'].every((field) => nonEmptyString(claim.source[field]))) {
      fail(`${claim.id ?? 'unknown'}: source requires title, HTTPS URL, locator, supports, and retrieval date.`);
    } else if (!claim.source.url.startsWith('https://')) {
      fail(`${claim.id}: source URL must use HTTPS.`);
    } else if (expectedSourceUrls[claim.id] !== claim.source.url) {
      fail(`${claim.id}: source URL differs from the reviewed primary source.`);
    }
    if (seenIds.has(claim.id)) fail(`duplicate id ${claim.id}.`);
    seenIds.add(claim.id);
  }
  for (const id of expectedIds) if (!seenIds.has(id)) fail(`missing required claim ${id}.`);
}

for (const component of renderedComponents) {
  const source = fs.readFileSync(path.join(root, component), 'utf8');
  if (!source.includes("expert-claims.json")) {
    fail(`${component} must import the reviewed expert-claim manifest.`);
  }
}

// The Carter Center's separate arithmetic-bound claim must remain traceable
// and mathematically consistent. Structural checks do not replace source review.
const boundPath = path.join(root, 'src/data/carter-bound.json');
const bound = JSON.parse(fs.readFileSync(boundPath, 'utf8'));
const evidenceSource = 'https://www.cartercenter.org/wp-content/uploads/2025/02/venezuela-final-report-2025-spanish.pdf';
if (bound.id !== 'carter-center-2025-unreported-vote-bound' ||
    bound.snapshotDate !== '2024-08-01' ||
    bound.source?.url !== evidenceSource ||
    !nonEmptyString(bound.source?.locator) ||
    !nonEmptyString(bound.source?.supports) ||
    !nonEmptyString(bound.source?.retrievedAt)) {
  fail('Carter arithmetic bound: reviewed identity, snapshot, source and locator required.');
}

for (const locale of ['es', 'en']) {
  const copy = bound.copy?.[locale];
  for (const field of ['tag', 'title', 'intro', 'leadLabel', 'upperLabel', 'balanceLabel', 'interpretation', 'caveat', 'footnote', 'sourceLabel', 'distinction']) {
    if (!nonEmptyString(copy?.[field])) fail(`Carter arithmetic bound: ${locale}.${field} required.`);
  }
}

const reported = bound.inputs || {};
const expected = {
  reportedCoveragePercent: 81.7,
  citizenActasInProse: 24533,
  citizenActasInTable: 24532,
  allStations: 30026,
  reportedGonzalezVotes: 7156462,
  reportedMaduroVotes: 3241461,
  reportedMargin: 3915001,
  registeredElectorsAtMissingStations: 3576544,
  minimumRemainingMargin: 338457,
};
for (const [key, value] of Object.entries(expected)) {
  if (reported[key] !== value) fail(`Carter arithmetic bound: unexpected ${key}.`);
}
if (reported.reportedGonzalezVotes - reported.reportedMaduroVotes !== reported.reportedMargin ||
    reported.reportedMargin - reported.registeredElectorsAtMissingStations !== reported.minimumRemainingMargin ||
    !(reported.minimumRemainingMargin > 0)) {
  fail('Carter arithmetic bound: the votes/electorate calculations do not balance.');
}
const anomalyComponent = fs.readFileSync(path.join(root, 'src/components/Anomaly.astro'), 'utf8');
if (!anomalyComponent.includes('carter-bound.json')) {
  fail('Carter arithmetic bound: live Anomaly component must import reviewed manifest.');
}


// Provenance is a separate, source-scoped, bilingual evidence manifest.
const provenance = JSON.parse(fs.readFileSync(path.join(root, 'src/data/acta-provenance.json'), 'utf8'));
const carterUrl = 'https://www.cartercenter.org/wp-content/uploads/2025/02/venezuela-final-report-2025.pdf';
const originalVideoInvestigation = 'https://www.cazadores.info/euforia-interrumpida-coinciden-videos-fotos-28j-con-resultados-publicados-en-linea/';
if (provenance.id !== 'acta-provenance-2024' ||
    provenance.process?.source?.url !== carterUrl ||
    provenance.authenticity?.source?.url !== carterUrl ||
    provenance.video?.source?.url !== originalVideoInvestigation) {
  fail('Acta-provenance: reviewed source or claim identity mismatch.');
}
for (const category of ['process', 'authenticity', 'video']) {
  const source = provenance[category]?.source;
  for (const field of ['title', 'url', 'locator', 'supports', 'retrievedAt']) {
    if (!nonEmptyString(source?.[field])) fail('Acta-provenance: missing ' + category + '.' + field);
  }
}
const videoEvidence = provenance.video || {};
if (videoEvidence.reviewed !== 50 || videoEvidence.exact !== 18 ||
    videoEvidence.stations !== 40 || videoEvidence.otherDifferences !== 9 ||
    videoEvidence.unmatched !== 23 || provenance.authenticity?.sampleStations !== 100) {
  fail('Acta-provenance: cited video and transcription figures changed.');
}
// Outcome categories in the original investigation are not asserted to be a disjoint partition.
for (const locale of ['es', 'en']) {
  const c = provenance.copy?.[locale];
  for (const field of ['eyebrow','title','accent','intro','visualTag','drawing','sourceProcess',
    'proofTitle','sourceEvidence','videoKicker','videoTitle','videoIntro','reviewedLabel',
    'exactLabel','stationsLabel','videoLimit','videoSource','limitTitle','limit','view','next']) {
    if (!nonEmptyString(c?.[field])) fail('Acta-provenance: missing ' + locale + '.' + field);
  }
  for (const [key, n] of [['steps', 3], ['checks', 3]]) {
    if (!Array.isArray(c?.[key]) || c[key].length !== n ||
        !c[key].every((row) => Array.isArray(row) && row.length === (key === 'steps' ? 3 : 2) && row.every(nonEmptyString))) {
      fail('Acta-provenance: missing bilingual ' + locale + '.' + key);
    }
  }
}
const provenanceComponent = fs.readFileSync(path.join(root, 'src/components/ActaProvenance.astro'), 'utf8');
if (!provenanceComponent.includes('acta-provenance.json') ||
    !provenanceComponent.includes('id="procedencia"')) fail('Acta-provenance: live exhibit must import reviewed claims.');
for (const page of ['src/pages/index.astro', 'src/pages/en/index.astro']) {
  if (!fs.readFileSync(path.join(root, page), 'utf8').includes('<ActaProvenance />')) {
    fail('Acta-provenance: section missing in ' + page);
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log('Expert and Carter-bound claim guardrails passed.');
