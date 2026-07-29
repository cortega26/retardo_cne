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

if (process.exitCode) process.exit(process.exitCode);
console.log('Expert-claim guardrail passed.');
