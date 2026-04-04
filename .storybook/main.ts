import type { StorybookConfig } from '@storybook-vue/nuxt'

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.stories.@(js|ts)',
  ],
  framework: {
    name: '@storybook-vue/nuxt',
    options: {},
  },
}

export default config
