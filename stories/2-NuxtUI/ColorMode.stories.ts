import type { Meta, StoryObj } from '@storybook/vue3'
import ColorModeToggle from './components/ColorModeToggle.vue'

const meta: Meta = { title: '2-NuxtUI/ColorMode' }
export default meta
type Story = StoryObj

export const Toggle: Story = {
  render: () => ({ components: { ColorModeToggle }, template: '<ColorModeToggle />' }),
}
