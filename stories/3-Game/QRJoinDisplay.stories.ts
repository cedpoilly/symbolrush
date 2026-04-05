import type { Meta, StoryObj } from '@storybook/vue3'
import QRJoinDisplay from '~/components/QRJoinDisplay.vue'

const meta: Meta<typeof QRJoinDisplay> = {
  title: '3-Game/QRJoinDisplay',
  component: QRJoinDisplay,
  args: { roomCode: 'DEMO42' },
}
export default meta
type Story = StoryObj<typeof QRJoinDisplay>

export const Default: Story = {}
