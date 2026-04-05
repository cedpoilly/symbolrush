import type { Meta, StoryObj } from '@storybook/vue3'
import ScoreFloat from '~/components/game/ScoreFloat.vue'
import SymbolGrid from '~/components/game/SymbolGrid.vue'
import { ref } from 'vue'

const meta: Meta<typeof ScoreFloat> = {
  title: '3-Game/ScoreFloat',
  component: ScoreFloat,
}
export default meta
type Story = StoryObj<typeof ScoreFloat>

export const Interactive: Story = {
  render: () => ({
    components: { ScoreFloat, SymbolGrid },
    setup() {
      const floatRef = ref<InstanceType<typeof ScoreFloat> | null>(null)
      const correctSymbol = '▲'

      function handleTap(event: MouseEvent, symbol: string) {
        const correct = symbol === correctSymbol
        floatRef.value?.show(event.clientX, event.clientY, correct, correct ? 10 : -5)
      }

      return { floatRef, handleTap }
    },
    template: `
      <div style="min-height: 300px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 24px;">
        <ScoreFloat ref="floatRef" />
        <p class="font-mono text-neutral-400 text-xs uppercase tracking-widest">Tap ▲ for +10, others for -5</p>
        <SymbolGrid :symbols="['▲', '●', '■', '✦']" @tap="handleTap" />
      </div>
    `,
  }),
}
