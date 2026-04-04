import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta = { title: '2-NuxtUI/ColorMode' }
export default meta
type Story = StoryObj

export const Toggle: Story = {
  render: () => ({
    template: `
      <div class="flex items-center gap-4 p-6">
        <span class="text-sm">Toggle theme:</span>
        <UColorModeButton />
      </div>
    `,
  }),
}
