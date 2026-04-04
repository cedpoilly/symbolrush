import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta = { title: '2-NuxtUI/Alert' }
export default meta
type Story = StoryObj

export const GameAlerts: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-4 p-6 max-w-md">
        <UAlert title="Room is full" description="This room has reached its player limit." color="error" />
        <UAlert title="Connection lost" description="Trying to reconnect..." color="warning" />
        <UAlert title="You're in!" description="Waiting for the host to start." color="success" />
      </div>
    `,
  }),
}
