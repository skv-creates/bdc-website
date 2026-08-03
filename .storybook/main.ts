import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
  // Stories sit next to the components they document, not in a parallel tree —
  // a component and its stories move, get renamed and get deleted together.
  "stories": [
    "../components/**/*.mdx",
    "../components/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-mcp"
  ],
  "framework": "@storybook/nextjs-vite",
  /**
   * Stories reference real site assets by absolute path — /figma/team/…,
   * /badges/… — because that is how the components reference them, and a
   * portrait card proves nothing rendered against a grey box.
   *
   * Worth knowing before trying to trim this: the built output carries a copy
   * of public/ (~49MB, so ~71MB in total), and setting this to [] does not stop
   * it. @storybook/nextjs-vite serves Next's public/ itself, as part of being
   * the Next framework adapter, and that is not reachable from here.
   *
   * It is bounded rather than growing, because scripts/build-storybook.mjs
   * deletes public/bdc-storybook before each build — without that the previous
   * build would be copied into the next one, and 71MB becomes 143MB becomes…
   * It is also staging-only, and Cloudflare uploads changed files only, so the
   * cost is one upload rather than one per deploy.
   */
  "staticDirs": [
    "../public"
  ]
};
export default config;