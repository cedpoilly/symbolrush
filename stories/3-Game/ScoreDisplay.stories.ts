import type { Meta, StoryObj } from '@storybook/vue3'
import ScoreDisplay from '~/components/ScoreDisplay.vue'
import { ref } from 'vue'

const meta: Meta<typeof ScoreDisplay> = {
  title: '3-Game/ScoreDisplay',
  component: ScoreDisplay,
  args: { score: 42 },
}
export default meta
type Story = StoryObj<typeof ScoreDisplay>

export const Default: Story = {}
export const WithFlash: Story = {
  render: () => ({
    components: { ScoreDisplay },
    setup() {
      const score = ref(42)
      const displayRef = ref<InstanceType<typeof ScoreDisplay> | null>(null)
      function correct() { score.value += 10; displayRef.value?.flash(true) }
      function wrong() { score.value -= 5; displayRef.value?.flash(false) }
      return { score, displayRef, correct, wrong }
    },
    template: `
      <div style="display: flex; align-items: center; gap: 16px; padding: 24px;">
        <ScoreDisplay ref="displayRef" :score="score" />
        <button @click="correct" style="padding: 8px 16px; background: var(--color-green-400); color: #06060e; border: none; border-radius: 6px; cursor: pointer;">+10</button>
        <button @click="wrong" style="padding: 8px 16px; background: var(--color-red-400); color: white; border: none; border-radius: 6px; cursor: pointer;">-5</button>
      </div>
    `,
  }),
}
