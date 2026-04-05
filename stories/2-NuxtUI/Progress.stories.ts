import type { Meta, StoryObj } from '@storybook/vue3'
import ProgressTimerStates from './components/ProgressTimerStates.vue'

const meta: Meta = { title: '2-NuxtUI/Progress' }
export default meta
type Story = StoryObj

export const TimerStates: Story = {
  render: () => ({ components: { ProgressTimerStates }, template: '<ProgressTimerStates />' }),
}
