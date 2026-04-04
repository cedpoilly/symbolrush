import type { Meta, StoryObj } from '@storybook/vue3'
import HostPanelLobby from './components/HostPanelLobby.vue'

const meta: Meta = {
  title: '4-Compositions/HostPanel',
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj

export const Lobby: Story = {
  render: () => ({ components: { HostPanelLobby }, template: '<HostPanelLobby />' }),
}
