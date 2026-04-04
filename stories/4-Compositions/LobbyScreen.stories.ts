import type { Meta, StoryObj } from '@storybook/vue3'

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
  render: () => ({
    template: `
      <div class="grid-bg min-h-screen grid grid-cols-[3fr_1fr] p-10 gap-6" style="background: var(--color-rush-950);">
        <div class="flex flex-col items-center justify-center gap-6">
          <span class="font-mono text-sm text-neutral-400 uppercase tracking-[0.15em]">SCAN TO JOIN</span>
          <div class="w-[300px] h-[300px] bg-neutral-800 rounded-xl flex items-center justify-center text-neutral-500 text-sm">
            QR Code Placeholder
          </div>
          <span class="font-mono font-black text-7xl text-primary">DEMO42</span>
        </div>
        <div class="flex flex-col gap-3 self-center">
          <p class="font-mono text-sm text-neutral-400"><span class="font-bold text-neutral-100">4</span> players</p>
          <UBadge color="success" variant="subtle" size="sm">Alice</UBadge>
          <UBadge color="success" variant="subtle" size="sm">Bob</UBadge>
          <UBadge color="success" variant="subtle" size="sm">Carol</UBadge>
          <UBadge color="success" variant="subtle" size="sm">Dave</UBadge>
          <p class="font-mono text-sm text-neutral-400 mt-auto">
            Starts in <span class="font-bold text-primary">45</span>s
          </p>
        </div>
      </div>
    `,
  }),
}
