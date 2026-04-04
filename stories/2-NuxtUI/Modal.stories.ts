import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'

const meta: Meta = { title: '2-NuxtUI/Modal' }
export default meta
type Story = StoryObj

export const JoinFlow: Story = {
  render: () => ({
    setup() {
      const open = ref(true)
      return { open }
    },
    template: `
      <UButton label="Open Join Modal" @click="open = true" />
      <UModal v-model:open="open" title="Join a Room">
        <template #body>
          <div class="flex flex-col gap-3 p-4">
            <UInput placeholder="ROOM CODE" :ui="{ base: 'font-mono font-bold text-xl text-center' }" />
            <UInput placeholder="Your name" />
            <UButton block label="Let's Go" />
          </div>
        </template>
      </UModal>
    `,
  }),
}
