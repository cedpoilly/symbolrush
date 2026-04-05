import type { Meta, StoryObj } from '@storybook/vue3'
import { h } from 'vue'

const colorScales = {
  cyan: { label: 'Primary (Cyan)', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  magenta: { label: 'Secondary (Magenta)', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  green: { label: 'Success (Green)', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  red: { label: 'Error (Red)', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  gold: { label: 'Warning (Gold)', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  rush: { label: 'Neutral (Rush)', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
}

const ColorPalette = {
  name: 'ColorPalette',
  setup() {
    return () =>
      h('div', { style: 'display: flex; flex-direction: column; gap: 32px; padding: 24px;' },
        Object.entries(colorScales).map(([name, { label, shades }]) =>
          h('div', {}, [
            h('h3', { style: 'font-family: Outfit, sans-serif; font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #e8e8f2;' }, label),
            h('div', { style: 'display: flex; gap: 4px;' },
              shades.map(shade =>
                h('div', {
                  style: `width: 60px; height: 60px; border-radius: 8px; background: var(--color-${name}-${shade}); display: flex; align-items: flex-end; justify-content: center; padding: 4px; font-size: 10px; font-family: monospace; color: ${shade < 400 ? '#06060e' : '#e8e8f2'};`,
                }, String(shade)),
              ),
            ),
          ]),
        ),
      )
  },
}

const meta: Meta = {
  title: '1-Tokens/Colors',
  component: ColorPalette as any,
}

export default meta
type Story = StoryObj
export const AllColors: Story = {}
