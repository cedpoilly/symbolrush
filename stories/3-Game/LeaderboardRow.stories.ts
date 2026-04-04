import type { Meta, StoryObj } from '@storybook/vue3'
import LeaderboardRow from '~/components/game/LeaderboardRow.vue'

const meta: Meta<typeof LeaderboardRow> = {
  title: '3-Game/LeaderboardRow',
  component: LeaderboardRow,
  args: { rank: 1, username: 'Alice', score: 120, isNewBest: false },
}
export default meta
type Story = StoryObj<typeof LeaderboardRow>

export const Gold: Story = {}
export const Silver: Story = { args: { rank: 2, username: 'Bob', score: 95 } }
export const Bronze: Story = { args: { rank: 3, username: 'Carol', score: 80 } }
export const NewBest: Story = { args: { rank: 1, username: 'Alice', score: 120, isNewBest: true } }
export const Regular: Story = { args: { rank: 7, username: 'Dave', score: 35 } }
