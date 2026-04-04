import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta = { title: '2-NuxtUI/Toast' }
export default meta
type Story = StoryObj

export const Notifications: Story = {
  render: () => ({
    setup() {
      const toast = useToast()
      return {
        showSuccess: () => toast.add({ title: 'Player joined!', description: 'Alice has joined the room', color: 'success' }),
        showError: () => toast.add({ title: 'Connection lost', description: 'Attempting to reconnect...', color: 'error' }),
        showInfo: () => toast.add({ title: 'Room code copied!', color: 'primary' }),
      }
    },
    template: `
      <div class="flex gap-3 p-6">
        <UButton label="Player Joined" color="success" @click="showSuccess" />
        <UButton label="Connection Error" color="error" @click="showError" />
        <UButton label="Code Copied" color="primary" variant="outline" @click="showInfo" />
      </div>
    `,
  }),
}
