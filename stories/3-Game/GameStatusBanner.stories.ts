import type { Meta, StoryObj } from '@storybook/vue3'
import GameStatusBanner from '~/components/game/GameStatusBanner.vue'

const meta: Meta<typeof GameStatusBanner> = {
  title: '3-Game/GameStatusBanner',
  component: GameStatusBanner,
  argTypes: {
    status: { control: 'select', options: ['connecting', 'waiting', 'lobby', 'playing', 'finished', 'results'] },
    roundCount: { control: 'number' },
  },
  args: { status: 'lobby', roundCount: 0 },
}
export default meta
type Story = StoryObj<typeof GameStatusBanner>

export const Lobby: Story = {}
export const Playing: Story = { args: { status: 'playing', roundCount: 3 } }
export const Results: Story = { args: { status: 'results', roundCount: 3 } }
