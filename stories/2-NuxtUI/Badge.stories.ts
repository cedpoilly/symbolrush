import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta = { title: '2-NuxtUI/Badge' }
export default meta
type Story = StoryObj

export const StatusVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 8px; padding: 24px;">
        <UBadge label="Waiting" color="primary" variant="subtle" />
        <UBadge label="Playing" color="success" variant="subtle" />
        <UBadge label="Results" color="warning" variant="subtle" />
        <UBadge label="NEW BEST" color="warning" variant="subtle" size="xs" />
        <UBadge label="Connected" color="success" variant="subtle" />
        <UBadge label="Disconnected" color="neutral" variant="subtle" />
      </div>
    `,
  }),
}
