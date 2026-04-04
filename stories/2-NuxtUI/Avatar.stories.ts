import type { Meta, StoryObj } from '@storybook/vue3'
import AvatarPlayerInitials from './components/AvatarPlayerInitials.vue'

const meta: Meta = { title: '2-NuxtUI/Avatar' }
export default meta
type Story = StoryObj

export const PlayerInitials: Story = {
  render: () => ({ components: { AvatarPlayerInitials }, template: '<AvatarPlayerInitials />' }),
}
