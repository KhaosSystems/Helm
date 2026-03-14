import type { Preview } from '@storybook/react-vite';
import theme from './matter-theme';
import addonPerformancePanel from '@github-ui/storybook-addon-performance-panel'

import '../src/index.css';

const preview: Preview = {
  parameters: {
    docs: {
      theme: theme,
    },

    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
    performance: {
      panel: addonPerformancePanel,
    },
  },
};

export default preview;
