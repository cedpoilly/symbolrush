import type { Meta, StoryObj } from '@storybook/vue3'
import ToastNotifications from './components/ToastNotifications.vue'

const meta: Meta = { title: '2-NuxtUI/Toast' }
export default meta
type Story = StoryObj

export const Notifications: Story = {
  render: () => ({ components: { ToastNotifications }, template: '<ToastNotifications />' }),
}
