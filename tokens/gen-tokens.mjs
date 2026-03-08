import fs from 'fs/promises';

// input/output paths
const inputFile = './tokens/tokens.dark.json';
const outputFile = './src/tokens.css';

function getReferenceName(value) {
  if (typeof value !== 'string' || !value.startsWith('{') || !value.endsWith('}')) {
    return null;
  }

  const ref = value.slice(1, -1); // remove {}
  const parts = ref.split('.');
  if (parts.length !== 2) return null;

  const [, name] = parts;
  return name;
}

function getCssValue(value) {
  const referenceName = getReferenceName(value);
  if (referenceName) {
    return `var(--${referenceName})`;
  }

  return value?.hex ?? null;
}

function getTokenNamespace(tokenName) {
  const parts = tokenName.split('-');
  if (parts.length < 2) return tokenName;
  return parts[1];
}

async function buildTokens() {
  const raw = await fs.readFile(inputFile, 'utf8');
  const data = JSON.parse(raw);

  const groups = ['primitive', 'semantic', 'component'];

  const cssLines = [
    '/**',
    ' * THIS FILE IS AUTO-GENERATED. DO NOT EDIT DIRECTLY!',
    ' *',
    " * To update tokens, replace 'tokens/tokens.dark.json' with a new JSON export",
    " * from Figma's Variables window: right click -> Export modes",
    ' * Then run: npm run gen:tokens',
    ' * ',
    ' * For relevant Tailwind docs regarding costomizing colors, see:',
    ' * https://tailwindcss.com/docs/colors#customizing-your-colors',
    ' */',
    '',
    '@theme {',
  ];

  for (const group of groups) {
    const tokens = data[group];
    if (!tokens) continue;

    cssLines.push(`  /* ${group.charAt(0).toUpperCase() + group.slice(1)} tokens */`);

    let previousNamespace = null;

    for (const [name, token] of Object.entries(tokens)) {
      const cssValue = getCssValue(token.$value);
      if (!cssValue) continue;

      const tokenNamespace = getTokenNamespace(name);
      if (previousNamespace && tokenNamespace !== previousNamespace) {
        cssLines.push('');
      }

      cssLines.push(`  --${name}: ${cssValue};`);
      previousNamespace = tokenNamespace;
    }

    cssLines.push(''); // empty line between sections
  }

  cssLines.push('}');

  await fs.writeFile(outputFile, cssLines.join('\n'));
  console.log('✅ tokens.css generated!');
}

buildTokens().catch((err) => console.error(err));
