import type { Meta, StoryObj } from '@storybook/vue3'
import SymbolGrid from '~/components/SymbolGrid.vue'

const meta: Meta<typeof SymbolGrid> = {
  title: '3-Game/SymbolGrid',
  component: SymbolGrid,
  args: { symbols: ['▲', '●', '■', '✦'], columns: 2 },
}
export default meta
type Story = StoryObj<typeof SymbolGrid>

export const TwoByTwo: Story = {}
export const ThreeByTwo: Story = {
  args: { symbols: ['▲', '●', '■', '✦', '◆', '✖'], columns: 3 },
}
