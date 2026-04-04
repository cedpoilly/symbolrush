import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta = { title: '2-NuxtUI/Avatar' }
export default meta
type Story = StoryObj

export const PlayerInitials: Story = {
  render: () => ({
    template: `
      <div class="flex gap-3 p-6">
        <UAvatar text="A" size="xs" />
        <UAvatar text="B" size="sm" />
        <UAvatar text="C" size="md" />
        <UAvatar text="D" size="lg" />
      </div>
    `,
  }),
}
