import type { Meta, StoryObj } from '@storybook/vue3'
import { h, ref } from 'vue'

const AnimationShowcase = {
  name: 'AnimationShowcase',
  setup() {
    const trigger = ref(0)
    function replay() { trigger.value++ }
    return () =>
      h('div', { style: 'padding: 24px; display: flex; flex-direction: column; gap: 32px; color: #e8e8f2;' }, [
        h('button', { onClick: replay, style: 'padding: 8px 16px; background: var(--color-cyan-400); color: #06060e; border: none; border-radius: 8px; cursor: pointer; font-family: monospace; font-weight: 700; align-self: flex-start;' }, 'Replay Animations'),
        h('div', { key: `se-${trigger.value}`, style: 'font-size: 48px; animation: symbol-enter 0.3s ease;' }, '▲ symbol-enter'),
        h('div', { key: `sd-${trigger.value}`, style: 'font-size: 18px; animation: slide-down 0.3s ease;' }, 'slide-down'),
        h('div', { key: `sil-${trigger.value}`, style: 'font-size: 18px; animation: slide-in-left 0.3s ease;' }, 'slide-in-left'),
        h('div', { style: 'position: relative; width: 200px; height: 200px; background: rgba(255,255,255,0.04); border-radius: 8px; overflow: hidden;' }, [
          h('div', { style: 'position: absolute; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--color-cyan-400), transparent); animation: scan 2.5s linear infinite;' }),
          h('span', { style: 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 12px; color: #7c7c96;' }, 'scan'),
        ]),
      ])
  },
}

const meta: Meta = {
  title: '1-Tokens/Animations',
  component: AnimationShowcase as any,
}

export default meta
type Story = StoryObj
export const AllAnimations: Story = {}
