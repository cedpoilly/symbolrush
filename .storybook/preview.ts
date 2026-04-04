import type { Preview } from '@storybook/vue3'

const preview: Preview = {
  parameters: {
    viewport: {
      viewports: {
        iphoneSE: {
          name: 'iPhone SE',
          styles: { width: '375px', height: '667px' },
        },
        iphone14: {
          name: 'iPhone 14',
          styles: { width: '390px', height: '844px' },
        },
        projector: {
          name: 'Projector (1080p)',
          styles: { width: '1920px', height: '1080px' },
        },
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#06060e' },
        { name: 'light', value: '#f6f6f8' },
      ],
    },
  },
}

export default preview
