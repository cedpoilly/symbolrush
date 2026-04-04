import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'

const meta: Meta = { title: '2-NuxtUI/Switch' }
export default meta
type Story = StoryObj

export const HostSettings: Story = {
  render: () => ({
    setup() {
      const autoStart = ref(true)
      const showScores = ref(false)
      return { autoStart, showScores }
    },
    template: `
      <div class="flex flex-col gap-4 p-6">
        <div class="flex items-center gap-3"><USwitch v-model="autoStart" /><span class="text-sm">Auto-start rounds</span></div>
        <div class="flex items-center gap-3"><USwitch v-model="showScores" /><span class="text-sm">Show live scores</span></div>
      </div>
    `,
  }),
}
