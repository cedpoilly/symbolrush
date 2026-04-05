import type { Meta, StoryObj } from '@storybook/vue3'
import SwitchHostSettings from './components/SwitchHostSettings.vue'

const meta: Meta = { title: '2-NuxtUI/Switch' }
export default meta
type Story = StoryObj

export const HostSettings: Story = {
  render: () => ({ components: { SwitchHostSettings }, template: '<SwitchHostSettings />' }),
}
