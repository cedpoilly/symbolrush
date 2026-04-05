import type { Meta, StoryObj } from '@storybook/vue3'
import LobbyScreenWithPlayers from './components/LobbyScreenWithPlayers.vue'

const meta: Meta = {
  title: '4-Compositions/LobbyScreen',
  parameters: {
    viewport: { defaultViewport: 'projector' },
    layout: 'fullscreen',
  },
}
export default meta
type Story = StoryObj

export const WithPlayers: Story = {
  render: () => ({ components: { LobbyScreenWithPlayers }, template: '<LobbyScreenWithPlayers />' }),
}
