import type { Meta, StoryObj } from '@storybook/vue3'
import { h } from 'vue'

const SpacingShowcase = {
  name: 'SpacingShowcase',
  setup() {
    const spacings = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48]
    return () =>
      h('div', { style: 'padding: 24px; color: #e8e8f2;' }, [
        h('h3', { style: 'font-size: 14px; font-weight: 600; margin-bottom: 16px; color: #7c7c96;' }, 'Tailwind Spacing Scale'),
        ...spacings.map(s =>
          h('div', { style: 'display: flex; align-items: center; gap: 12px; margin-bottom: 4px;' }, [
            h('span', { style: 'font-family: monospace; font-size: 12px; min-width: 40px; color: #7c7c96;' }, String(s)),
            h('div', { style: `width: ${s * 4}px; height: 16px; background: var(--color-cyan-400); border-radius: 2px; opacity: 0.7;` }),
            h('span', { style: 'font-family: monospace; font-size: 11px; color: #60607a;' }, `${s * 4}px`),
          ]),
        ),
      ])
  },
}

const meta: Meta = {
  title: '1-Tokens/Spacing',
  component: SpacingShowcase,
}

export default meta
type Story = StoryObj
export const Scale: Story = {}
