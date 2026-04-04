import type { Meta, StoryObj } from '@storybook/vue3'
import AlertGameAlerts from './components/AlertGameAlerts.vue'

const meta: Meta = { title: '2-NuxtUI/Alert' }
export default meta
type Story = StoryObj

export const GameAlerts: Story = {
  render: () => ({ components: { AlertGameAlerts }, template: '<AlertGameAlerts />' }),
}
