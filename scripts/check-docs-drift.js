// Verifies that AGENTS.md's <!-- DRIFT-CHECK:* --> blocks match the current
// repo state. Run by the `docs-drift-check` job in .github/workflows/ci.yml
// on every push/PR to main. See "Keeping this file current" in AGENTS.md.
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const agentsPath = path.join(rootDir, 'AGENTS.md');

function readDriftBlocks(markdown) {
  const blocks = {};
  const re = /<!--\s*DRIFT-CHECK:([\w-]+)\s*\n([\s\S]*?)\n-->/g;
  let match;
  while ((match = re.exec(markdown))) {
    const [, name, body] = match;
    blocks[name] = body
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return blocks;
}

function actualNpmScripts() {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'),
  );
  return Object.keys(pkg.scripts || {});
}

function importedComponentNames(astroFilePath) {
  const source = fs.readFileSync(astroFilePath, 'utf8');
  const re =
    /^import\s+(\w+)\s+from\s+['"]\.\.\/(?:\.\.\/)?components\/\w+\.astro['"];?/gm;
  const names = [];
  let match;
  while ((match = re.exec(source))) {
    names.push(match[1]);
  }
  return names;
}

function actualSectionOrder() {
  return importedComponentNames(path.join(rootDir, 'src/pages/index.astro'));
}

function actualUnimportedByPages() {
  const componentsDir = path.join(rootDir, 'src/components');
  const pagesDir = path.join(rootDir, 'src/pages');
  const componentFiles = fs
    .readdirSync(componentsDir)
    .filter((f) => f.endsWith('.astro'))
    .map((f) => f.replace(/\.astro$/, ''));

  const pageFiles = walk(pagesDir).filter((f) => f.endsWith('.astro'));
  const pagesSource = pageFiles
    .map((f) => fs.readFileSync(f, 'utf8'))
    .join('\n');

  return componentFiles
    .filter(
      (name) =>
        !new RegExp(`components/${name}(\\.astro)?['"]`).test(pagesSource),
    )
    .sort();
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function sameSet(a, b) {
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.length === sb.length && sa.every((v, i) => v === sb[i]);
}

function sameOrder(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function diffSets(expected, actual) {
  const missing = expected.filter((v) => !actual.includes(v));
  const extra = actual.filter((v) => !expected.includes(v));
  return { missing, extra };
}

function main() {
  if (!fs.existsSync(agentsPath)) {
    console.error('AGENTS.md not found at repo root.');
    process.exit(1);
  }

  const blocks = readDriftBlocks(fs.readFileSync(agentsPath, 'utf8'));
  let failed = false;

  const checks = [
    {
      name: 'npm-scripts',
      expected: blocks['npm-scripts'],
      actual: actualNpmScripts(),
      ordered: false,
      source: 'package.json "scripts"',
    },
    {
      name: 'section-order',
      expected: blocks['section-order'],
      actual: actualSectionOrder(),
      ordered: true,
      source: 'component imports in src/pages/index.astro',
    },
    {
      name: 'unimported-by-pages',
      expected: blocks['unimported-by-pages'],
      actual: actualUnimportedByPages(),
      ordered: false,
      source: 'src/components/*.astro not imported anywhere under src/pages/',
    },
  ];

  for (const check of checks) {
    if (!check.expected) {
      console.error(
        `AGENTS.md is missing a <!-- DRIFT-CHECK:${check.name} --> block.`,
      );
      failed = true;
      continue;
    }

    const matches = check.ordered
      ? sameOrder(check.expected, check.actual)
      : sameSet(check.expected, check.actual);

    if (!matches) {
      failed = true;
      console.error(`\nDrift detected: ${check.name}`);
      console.error(`  Live source: ${check.source}`);
      console.error(`  AGENTS.md says:  ${check.expected.join(', ')}`);
      console.error(`  Repo actually:   ${check.actual.join(', ')}`);
      if (!check.ordered) {
        const { missing, extra } = diffSets(check.expected, check.actual);
        if (missing.length)
          console.error(`  Missing from AGENTS.md: ${missing.join(', ')}`);
        if (extra.length)
          console.error(`  Not documented in AGENTS.md: ${extra.join(', ')}`);
      }
    }
  }

  const esOrder = actualSectionOrder();
  const enOrder = importedComponentNames(
    path.join(rootDir, 'src/pages/en/index.astro'),
  );
  if (!sameOrder(esOrder, enOrder)) {
    failed = true;
    console.error('\nDrift detected: es/en section-order mismatch');
    console.error(
      '  AGENTS.md claims src/pages/en/index.astro mirrors src/pages/index.astro.',
    );
    console.error(`  ES (src/pages/index.astro):    ${esOrder.join(', ')}`);
    console.error(`  EN (src/pages/en/index.astro): ${enOrder.join(', ')}`);
  }

  if (failed) {
    console.error(
      '\nAGENTS.md has drifted from the repo. Update the relevant ' +
        '<!-- DRIFT-CHECK:* --> block(s) in AGENTS.md (and the surrounding ' +
        'prose, if it also describes the old state) in this PR.',
    );
    process.exit(1);
  }

  console.log('AGENTS.md drift check passed.');
}

main();
