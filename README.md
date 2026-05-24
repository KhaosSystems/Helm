# Helm (Matter Design System)

https://www.npmjs.com/package/@khaos-systems/helm

This package contains the Matter design system and Storybook site extracted from `anchor`.

## Command Cheat Sheet

- `npm install`
- `npm run storybook` - run Storybook locally
- `npm run build-storybook` - static Storybook build
- `npm run build` - build library output to `dist/`
- `npm run gen:tokens` - regenerate `src/tokens.css` from `tokens/tokens.dark.json`

**To publish a new version:**
```
npm version patch # or minor/major
npm run prepare
npm run publish
```

## Usage in another app

Install from workspace and import:

```ts
import { MtButton } from '@khaos-systems/helm';
import '@khaos-systems/helm/styles.css';
```

### Tailwind-native consumption (recommended)

For apps that already compile Tailwind, consume Helm through Tailwind so client
builds generate only the utilities they use (including token-based classes like
`bg-surface-panel`).

In your app stylesheet (compiled by Tailwind):

```css
@import "tailwindcss";
@import "@khaos-systems/helm/tailwind.css";
```

Notes:
- `@khaos-systems/helm/tailwind.css` includes Helm tokens and `@source` rules
	that point to Helm component source files.
- Keep `tailwind.css` import in the app pipeline so utilities like `bg-...`,
	`text-...`, and `border-...` are generated from Helm color tokens when used
	by the app.

### Precompiled CSS consumption

If you are not compiling Tailwind in the client app, continue importing:

```ts
import '@khaos-systems/helm/styles.css';
```
