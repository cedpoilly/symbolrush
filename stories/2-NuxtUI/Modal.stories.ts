import type { Meta, StoryObj } from '@storybook/vue3'
import ModalJoinFlow from './components/ModalJoinFlow.vue'

const meta: Meta = { title: '2-NuxtUI/Modal' }
export default meta
type Story = StoryObj

export const JoinFlow: Story = {
  render: () => ({ components: { ModalJoinFlow }, template: '<ModalJoinFlow />' }),
}
