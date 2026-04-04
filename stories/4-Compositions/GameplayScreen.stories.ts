import type { Meta, StoryObj } from '@storybook/vue3'
import SymbolGrid from '~/components/game/SymbolGrid.vue'
import ScoreDisplay from '~/components/game/ScoreDisplay.vue'
import TimerBar from '~/components/game/TimerBar.vue'

const meta: Meta = {
  title: '4-Compositions/GameplayScreen',
  parameters: {
    viewport: { defaultViewport: 'iphoneSE' },
    layout: 'fullscreen',
  },
}
export default meta
type Story = StoryObj

export const Playing: Story = {
  render: () => ({
    components: { SymbolGrid, ScoreDisplay, TimerBar },
    template: `
      <div class="grid-bg grid-bg-phone min-h-screen relative select-none" style="background: var(--color-rush-950); color: var(--color-rush-100);">
        <TimerBar :time-remaining-ms="20000" :total-duration-ms="30000" />
        <div class="min-h-screen flex flex-col items-center pt-6 px-6 relative z-1 gap-4">
          <div class="w-full flex justify-between items-center px-1">
            <span class="font-mono text-neutral-400">22s</span>
            <ScoreDisplay :score="30" />
          </div>
          <p class="font-mono text-neutral-400 text-xs uppercase tracking-widest">
            TAP THE SYMBOL ON SCREEN!
          </p>
          <SymbolGrid :symbols="['▲', '●', '■', '✦']" class="mt-auto mb-auto" />
        </div>
      </div>
    `,
  }),
}
