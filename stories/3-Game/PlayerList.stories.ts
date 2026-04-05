import type { Meta, StoryObj } from '@storybook/vue3'
import PlayerList from '~/components/PlayerList.vue'

const players = [
  { id: '1', username: 'Alice' },
  { id: '2', username: 'Bob' },
  { id: '3', username: 'Carol' },
  { id: '4', username: 'Dave' },
]

const meta: Meta<typeof PlayerList> = {
  title: '3-Game/PlayerList',
  component: PlayerList,
  args: { players },
}
export default meta
type Story = StoryObj<typeof PlayerList>

export const Default: Story = {}
export const Empty: Story = { args: { players: [] } }
export const WithScores: Story = {
  args: { players, scores: { '1': 120, '2': 95, '3': 80, '4': 60 } },
}
