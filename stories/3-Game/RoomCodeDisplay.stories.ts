import type { Meta, StoryObj } from '@storybook/vue3'
import RoomCodeDisplay from '~/components/game/RoomCodeDisplay.vue'

const meta: Meta<typeof RoomCodeDisplay> = {
  title: '3-Game/RoomCodeDisplay',
  component: RoomCodeDisplay,
  args: { code: 'ABCD12', size: 'md', copyable: true },
}
export default meta
type Story = StoryObj<typeof RoomCodeDisplay>

export const Default: Story = {}
export const Large: Story = { args: { size: 'lg' } }
export const Small: Story = { args: { size: 'sm' } }
export const NoCopy: Story = { args: { copyable: false } }
