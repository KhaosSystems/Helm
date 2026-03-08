/**
 * This file is used to create a custom theme for Storybook.
 * See: https://storybook.js.org/docs/configure/user-interface/theming
 */

import { create } from 'storybook/theming/create';

export default create({
  base: 'dark',

  // Typography
  fontBase: '"Open Sans", sans-serif',
  fontCode: 'monospace',
  brandTitle: 'Khaos Matter',
  brandUrl: 'https://khaos.systems',
  brandImage: '/matter-brand-storybook.png',
  brandTarget: '_self',

  // Brand colors
  colorPrimary: '#BB40F4',
  colorSecondary: '#BB40F4',

  // UI
  appBg: '#111111',
  appHoverBg: '#1A1A1A',
  appContentBg: '#141414',
  appPreviewBg: '#0F0F0F',
  appBorderColor: '#222222',
  appBorderRadius: 4,

  // Text colors
  textColor: '#BBBBBB',
  textInverseColor: '#FFFFFF',
  textMutedColor: '#666666',

  // Toolbar default and active colors
  barTextColor: '#BBBBBB',
  barHoverColor: '#BB40F4',
  barSelectedColor: '#BB40F4',
  barBg: '#141414',

  // Buttons
  buttonBg: '#1A1A1A',
  buttonBorder: '#BB40F4',

  // Boolean controls (toggles)
  booleanBg: '#1A1A1A',
  booleanSelectedBg: '#BB40F4',

  // Form colors
  inputBg: '#0F0F0F',
  inputBorder: '#222222',
  inputTextColor: '#BBBBBB',
  inputBorderRadius: 4,
});
