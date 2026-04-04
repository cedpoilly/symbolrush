import type { Meta, StoryObj } from '@storybook/vue3'
import { h } from 'vue'

const TypographyShowcase = {
  name: 'TypographyShowcase',
  setup() {
    const samples = [
      { family: 'font-sans', label: 'Outfit (Sans)', weights: ['400', '500', '600', '700'] },
      { family: 'font-mono', label: 'Azeret Mono', weights: ['400', '700', '900'] },
    ]
    const sizes = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl']

    return () =>
      h('div', { style: 'display: flex; flex-direction: column; gap: 40px; padding: 24px; color: #e8e8f2;' }, [
        ...samples.map(({ family, label, weights }) =>
          h('div', {}, [
            h('h3', { style: 'font-size: 14px; font-weight: 600; margin-bottom: 12px; color: #7c7c96;' }, label),
            ...weights.map(w =>
              h('p', { class: family, style: `font-weight: ${w}; font-size: 24px; margin-bottom: 8px;` }, `Weight ${w} — The quick brown fox jumps over the lazy dog`),
            ),
          ]),
        ),
        h('div', {}, [
          h('h3', { style: 'font-size: 14px; font-weight: 600; margin-bottom: 12px; color: #7c7c96;' }, 'Size Scale'),
          ...sizes.map(size =>
            h('p', { class: `font-sans ${size}`, style: 'margin-bottom: 6px;' }, `${size} — Symbol Rush`),
          ),
        ]),
      ])
  },
}

const meta: Meta = {
  title: '1-Tokens/Typography',
  component: TypographyShowcase,
}

export default meta
type Story = StoryObj
export const FontFamilies: Story = {}
