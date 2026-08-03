import { addons } from 'storybook/manager-api';
import theme from './theme';

addons.setConfig({
  theme,
  // Foundations first, then the components built from them. Without this the
  // sidebar sorts alphabetically and "Foundations" lands under "components",
  // which inverts the thing the system is trying to teach.
  sidebar: {
    showRoots: true,
  },
});
