import type { Meta, StoryObj } from '@storybook/vue3'
import InputDefault from './components/InputDefault.vue'

const meta: Meta = { title: '2-NuxtUI/Input' }
export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => ({ components: { InputDefault }, template: '<InputDefault />' }),
}
