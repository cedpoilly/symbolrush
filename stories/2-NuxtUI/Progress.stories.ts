import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta = { title: '2-NuxtUI/Progress' }
export default meta
type Story = StoryObj

export const TimerStates: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; padding: 24px; max-width: 400px;">
        <div><p style="font-size: 12px; margin-bottom: 4px; color: #7c7c96;">Normal (75%)</p><UProgress :model-value="75" color="primary" size="xs" /></div>
        <div><p style="font-size: 12px; margin-bottom: 4px; color: #7c7c96;">Urgent (20%)</p><UProgress :model-value="20" color="secondary" size="xs" /></div>
        <div><p style="font-size: 12px; margin-bottom: 4px; color: #7c7c96;">Almost done (5%)</p><UProgress :model-value="5" color="secondary" size="xs" /></div>
      </div>
    `,
  }),
}
