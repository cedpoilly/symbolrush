import type { Meta, StoryObj } from '@storybook/vue3'
import TimerBar from '~/components/TimerBar.vue'

const meta: Meta<typeof TimerBar> = {
  title: '3-Game/TimerBar',
  component: TimerBar,
  argTypes: {
    timeRemainingMs: { control: { type: 'range', min: 0, max: 30000, step: 1000 } },
    totalDurationMs: { control: 'number' },
    urgentThresholdMs: { control: 'number' },
  },
  args: { timeRemainingMs: 20000, totalDurationMs: 30000, urgentThresholdMs: 8000 },
}
export default meta
type Story = StoryObj<typeof TimerBar>

export const Normal: Story = {}
export const Urgent: Story = { args: { timeRemainingMs: 5000 } }
export const AlmostDone: Story = { args: { timeRemainingMs: 1000 } }
