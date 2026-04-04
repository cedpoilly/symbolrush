import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta = {
  title: '2-NuxtUI/Button',
}

export default meta
type Story = StoryObj

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 12px; padding: 24px;">
        <UButton label="Solid" color="primary" variant="solid" />
        <UButton label="Outline" color="primary" variant="outline" />
        <UButton label="Soft" color="primary" variant="soft" />
        <UButton label="Subtle" color="primary" variant="subtle" />
        <UButton label="Ghost" color="primary" variant="ghost" />
        <UButton label="Link" color="primary" variant="link" />
      </div>
    `,
  }),
}

export const AllColors: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 12px; padding: 24px;">
        <UButton label="Primary" color="primary" />
        <UButton label="Secondary" color="secondary" />
        <UButton label="Success" color="success" />
        <UButton label="Error" color="error" />
        <UButton label="Warning" color="warning" />
        <UButton label="Neutral" color="neutral" />
      </div>
    `,
  }),
}

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center; padding: 24px;">
        <UButton label="XS" size="xs" />
        <UButton label="SM" size="sm" />
        <UButton label="MD" size="md" />
        <UButton label="LG" size="lg" />
        <UButton label="XL" size="xl" />
      </div>
    `,
  }),
}
