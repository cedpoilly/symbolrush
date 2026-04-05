import type { Meta, StoryObj } from '@storybook/vue3'
import ButtonAllVariants from './components/ButtonAllVariants.vue'
import ButtonAllColors from './components/ButtonAllColors.vue'
import ButtonSizes from './components/ButtonSizes.vue'

const meta: Meta = {
  title: '2-NuxtUI/Button',
}

export default meta
type Story = StoryObj

export const AllVariants: Story = {
  render: () => ({ components: { ButtonAllVariants }, template: '<ButtonAllVariants />' }),
}

export const AllColors: Story = {
  render: () => ({ components: { ButtonAllColors }, template: '<ButtonAllColors />' }),
}

export const Sizes: Story = {
  render: () => ({ components: { ButtonSizes }, template: '<ButtonSizes />' }),
}
