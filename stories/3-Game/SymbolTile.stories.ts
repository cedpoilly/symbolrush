import type { Meta, StoryObj } from '@storybook/vue3'
import SymbolTile from '~/components/game/SymbolTile.vue'

const meta: Meta<typeof SymbolTile> = {
  title: '3-Game/SymbolTile',
  component: SymbolTile,
  argTypes: {
    symbol: { control: 'select', options: ['▲', '●', '■', '✦', '◆', '✖'] },
  },
  args: { symbol: '▲' },
}
export default meta
type Story = StoryObj<typeof SymbolTile>

export const Default: Story = {}

export const AllSymbols: Story = {
  render: () => ({
    components: { SymbolTile },
    template: `
      <div style="display: grid; grid-template-columns: repeat(3, 80px); gap: 12px; padding: 24px;">
        <SymbolTile symbol="▲" />
        <SymbolTile symbol="●" />
        <SymbolTile symbol="■" />
        <SymbolTile symbol="✦" />
        <SymbolTile symbol="◆" />
        <SymbolTile symbol="✖" />
      </div>
    `,
  }),
}
