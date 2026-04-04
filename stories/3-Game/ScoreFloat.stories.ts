import type { Meta, StoryObj } from '@storybook/vue3'
import ScoreFloat from '~/components/game/ScoreFloat.vue'
import { ref } from 'vue'

const meta: Meta<typeof ScoreFloat> = {
  title: '3-Game/ScoreFloat',
  component: ScoreFloat,
}
export default meta
type Story = StoryObj<typeof ScoreFloat>

export const Interactive: Story = {
  render: () => ({
    components: { ScoreFloat },
    setup() {
      const floatRef = ref<InstanceType<typeof ScoreFloat> | null>(null)
      function showCorrect(e: MouseEvent) { floatRef.value?.show(e.clientX, e.clientY, true, 10) }
      function showWrong(e: MouseEvent) { floatRef.value?.show(e.clientX, e.clientY, false, -5) }
      return { floatRef, showCorrect, showWrong }
    },
    template: `
      <div style="padding: 48px; display: flex; gap: 16px;">
        <ScoreFloat ref="floatRef" />
        <button @click="showCorrect" style="padding: 16px 32px; background: var(--color-green-400); color: #06060e; border: none; border-radius: 8px; cursor: pointer; font-weight: 700;">Click for +10</button>
        <button @click="showWrong" style="padding: 16px 32px; background: var(--color-red-400); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700;">Click for -5</button>
      </div>
    `,
  }),
}
