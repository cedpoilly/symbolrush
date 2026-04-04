import type { Meta, StoryObj } from '@storybook/vue3'
import RoomCodeDisplay from '~/components/game/RoomCodeDisplay.vue'
import GameStatusBanner from '~/components/game/GameStatusBanner.vue'
import PlayerList from '~/components/game/PlayerList.vue'

const meta: Meta = {
  title: '4-Compositions/HostPanel',
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj

export const Lobby: Story = {
  render: () => ({
    components: { RoomCodeDisplay, GameStatusBanner, PlayerList },
    template: `
      <div class="grid-bg min-h-screen flex justify-center p-8" style="background: var(--color-rush-950); color: var(--color-rush-100);">
        <div class="w-full max-w-[480px] flex flex-col relative z-1">
          <div class="flex items-center justify-between pb-6 mb-6 border-b border-neutral-800">
            <h1 class="font-mono font-black text-xl text-primary tracking-wide">
              SYMBOL<span class="text-neutral-400">RUSH</span>
            </h1>
            <span class="w-2 h-2 rounded-full bg-success shadow-[0_0_6px_rgba(0,255,136,0.4)]" />
          </div>

          <div class="py-4 border-b border-neutral-900">
            <div class="flex items-baseline gap-3 mb-2">
              <span class="text-sm text-neutral-400">Room</span>
              <RoomCodeDisplay code="DEMO42" size="sm" />
            </div>
            <GameStatusBanner status="lobby" />
          </div>

          <div class="py-4 border-b border-neutral-900">
            <h2 class="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              Players <UBadge variant="subtle" color="neutral" size="xs">3</UBadge>
            </h2>
            <PlayerList
              :players="[
                { id: '1', username: 'Alice' },
                { id: '2', username: 'Bob' },
                { id: '3', username: 'Carol' },
              ]"
              :scores="{ '1': 120, '2': 95, '3': 80 }"
            />
          </div>

          <div class="pt-5">
            <UButton block size="lg">Start Round</UButton>
          </div>
        </div>
      </div>
    `,
  }),
}
