# Helm (Matter Design System)

https://www.npmjs.com/package/@khaos-systems/helm

This package contains the Matter design system and Storybook site extracted from `anchor`. 

## Commands

- `npm install`
- `npm run storybook` - run Storybook locally
- `npm run build-storybook` - static Storybook build
- `npm run build` - build library output to `dist/`
- `npm run gen:tokens` - regenerate `src/tokens.css` from `tokens/tokens.dark.json`

## Usage in another app

Install from workspace and import:

```ts
import { MtButton } from '@khaos/matter';
import '@khaos/matter/styles.css';
```
