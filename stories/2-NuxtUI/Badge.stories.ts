import type { Meta, StoryObj } from '@storybook/vue3'
import BadgeStatusVariants from './components/BadgeStatusVariants.vue'

const meta: Meta = { title: '2-NuxtUI/Badge' }
export default meta
type Story = StoryObj

export const StatusVariants: Story = {
  render: () => ({ components: { BadgeStatusVariants }, template: '<BadgeStatusVariants />' }),
}
