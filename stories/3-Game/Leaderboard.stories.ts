import type { Meta, StoryObj } from '@storybook/vue3'
import Leaderboard from '~/components/Leaderboard.vue'

const sampleEntries = [
  { playerId: '1', username: 'Alice', bestScore: 120, sessionCount: 3 },
  { playerId: '2', username: 'Bob', bestScore: 95, sessionCount: 3 },
  { playerId: '3', username: 'Carol', bestScore: 80, sessionCount: 2 },
  { playerId: '4', username: 'Dave', bestScore: 60, sessionCount: 1 },
  { playerId: '5', username: 'Eve', bestScore: 45, sessionCount: 2 },
]

const meta: Meta<typeof Leaderboard> = {
  title: '3-Game/Leaderboard',
  component: Leaderboard,
  args: { entries: sampleEntries },
}
export default meta
type Story = StoryObj<typeof Leaderboard>

export const Default: Story = {}
export const Empty: Story = { args: { entries: [] } }
export const WithNewBest: Story = {
  args: { entries: sampleEntries, sessionScores: [{ playerId: '1', username: 'Alice', score: 120 }] },
}
