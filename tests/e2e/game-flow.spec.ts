import { test, expect, type Page, type BrowserContext } from '@playwright/test'

/**
 * Viewport presets:
 * - Mobile (host + player): 390×844 (iPhone 14 Pro)
 * - Public Screen: 1280×720 (HD 16:9)
 */
const MOBILE = { width: 390, height: 844 }
const PS_HD = { width: 1280, height: 720 }

const SCREENSHOT_DIR = 'screenshots'

async function screenshot(page: Page, name: string) {
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/${name}.png`,
    fullPage: false,
  })
}

test.describe('Symbol Rush — Full Game Flow', () => {
  let hostContext: BrowserContext
  let playerContext: BrowserContext
  let psContext: BrowserContext
  let hostPage: Page
  let playerPage: Page
  let psPage: Page
  let roomCode: string

  test.beforeAll(async ({ browser }) => {
    hostContext = await browser.newContext({ viewport: MOBILE })
    playerContext = await browser.newContext({ viewport: MOBILE })
    psContext = await browser.newContext({ viewport: PS_HD })

    hostPage = await hostContext.newPage()
    playerPage = await playerContext.newPage()
    psPage = await psContext.newPage()
  })

  test.afterAll(async () => {
    await hostContext.close()
    await playerContext.close()
    await psContext.close()
  })

  test('01 — Landing page', async () => {
    await hostPage.goto('/')
    await expect(hostPage.getByRole('heading', { name: /SYMBOLRUSH/i })).toBeVisible()
    await expect(hostPage.getByRole('button', { name: 'Join Game' })).toBeVisible()
    await expect(hostPage.getByRole('button', { name: 'Host a Room' })).toBeVisible()
    await screenshot(hostPage, '01-landing')
  })

  test('02 — Join form', async () => {
    await hostPage.getByRole('button', { name: 'Join Game' }).click()
    await expect(hostPage.locator('input[placeholder="ROOM CODE"]')).toBeVisible()
    await expect(hostPage.locator('input[placeholder="Your name"]')).toBeVisible()
    await screenshot(hostPage, '02-join-form')
    await hostPage.getByRole('button', { name: '← Back' }).click()
  })

  test('03 — Host creates room', async () => {
    await hostPage.goto('/host')
    await hostPage.waitForTimeout(3000)

    const codeEl = hostPage.locator('.room-code')
    await expect(codeEl).toBeVisible()
    roomCode = (await codeEl.textContent())!.trim()
    expect(roomCode).toMatch(/^[A-Z0-9]{6}$/)

    await screenshot(hostPage, '03-host-lobby')
  })

  test('04 — Public Screen — lobby', async () => {
    await psPage.goto(`/ps/${roomCode}`)
    await psPage.waitForTimeout(3000)

    await expect(psPage.locator('canvas')).toBeVisible()
    await screenshot(psPage, '04-ps-lobby-empty')
  })

  test('05 — Player joins via room code', async () => {
    await playerPage.goto(`/?room=${roomCode}`)
    await playerPage.waitForTimeout(500)

    // Room code should be pre-filled
    const codeInput = playerPage.locator('input[placeholder="ROOM CODE"]')
    await expect(codeInput).toBeVisible()
    await expect(codeInput).toHaveValue(roomCode)

    await screenshot(playerPage, '05-player-join-prefilled')

    // Enter username and submit
    await playerPage.locator('input[placeholder="Your name"]').fill('Alice')
    await playerPage.getByRole('button', { name: "Let's Go" }).click()
    await playerPage.waitForTimeout(2000)

    // Should be on the play page in waiting state
    await expect(playerPage).toHaveURL(new RegExp(`/play/${roomCode}`))
    await expect(playerPage.locator('text=You\'re in')).toBeVisible()
    await screenshot(playerPage, '06-player-waiting')
  })

  test('06 — PS shows player joined', async () => {
    await psPage.waitForTimeout(1000)
    await screenshot(psPage, '07-ps-lobby-with-player')
  })

  test('07 — Add more players via WebSocket', async () => {
    // Join 4 more players directly via WS for a fuller lobby
    const names = ['Bob', 'Charlie', 'Diana', 'Ethan']
    for (const name of names) {
      await hostPage.evaluate(
        async ({ code, username }) => {
          return new Promise<boolean>((resolve) => {
            const ws = new WebSocket(`ws://${window.location.host}/api/ws`)
            ws.onopen = () => ws.send(JSON.stringify({ type: 'player:join', roomCode: code, username }))
            ws.onmessage = (e) => {
              if (JSON.parse(e.data).type === 'room:status') resolve(true)
            }
            setTimeout(() => resolve(false), 3000)
          })
        },
        { code: roomCode, username: name },
      )
      await hostPage.waitForTimeout(300)
    }

    await psPage.waitForTimeout(1000)
    await screenshot(psPage, '08-ps-lobby-5-players')
    await screenshot(hostPage, '09-host-5-players')
  })

  test('08 — Host starts round', async () => {
    const startBtn = hostPage.getByRole('button', { name: 'Start Round' })
    await expect(startBtn).toBeEnabled()
    await startBtn.click()
    await hostPage.waitForTimeout(1500)

    // Host sees current symbol
    await expect(hostPage.locator('text=Current symbol')).toBeVisible()
    await screenshot(hostPage, '10-host-round-playing')
  })

  test('09 — PS shows symbol during round', async () => {
    await psPage.waitForTimeout(1000)
    // PS should be in playing phase with a large symbol
    await screenshot(psPage, '11-ps-playing-symbol')
  })

  test('10 — Player sees symbol grid', async () => {
    await expect(playerPage.locator('text=TAP THE SYMBOL')).toBeVisible()
    await screenshot(playerPage, '12-player-playing-grid')
  })

  test('11 — Player taps symbols', async () => {
    // Tap the first symbol
    const buttons = playerPage.locator('button').filter({ hasText: /[▲●■✦]/ })
    const firstBtn = buttons.first()
    await expect(firstBtn).toBeVisible()
    await firstBtn.click()
    await playerPage.waitForTimeout(300)
    await screenshot(playerPage, '13-player-after-first-tap')

    // Tap a few more
    for (let i = 0; i < 3; i++) {
      const btn = buttons.nth(i % 4)
      await btn.click()
      await playerPage.waitForTimeout(500)
    }
    await screenshot(playerPage, '14-player-after-multiple-taps')
  })

  test('12 — Mid-round PS with scores', async () => {
    await screenshot(psPage, '15-ps-mid-round')
  })

  test('13 — Round ends', async () => {
    // Wait for round to finish (30s total, we've used ~5s)
    await hostPage.waitForTimeout(27_000)

    // Host should show Next Round
    await expect(hostPage.getByRole('button', { name: 'Next Round' })).toBeVisible({ timeout: 5000 })
    await screenshot(hostPage, '16-host-round-ended')
  })

  test('14 — PS shows results / leaderboard', async () => {
    await psPage.waitForTimeout(1000)
    await screenshot(psPage, '17-ps-results-leaderboard')
  })

  test('15 — Player sees results', async () => {
    await expect(playerPage.locator('text=/Nice run|Keep going|Warm up/')).toBeVisible({ timeout: 5000 })
    await screenshot(playerPage, '18-player-results')
  })

  test('16 — Host starts next round', async () => {
    await hostPage.getByRole('button', { name: 'Next Round' }).click()
    await hostPage.waitForTimeout(1500)

    await expect(hostPage.locator('text=Current symbol')).toBeVisible()
    await screenshot(hostPage, '19-host-round-2-playing')
  })

  test('17 — PS round 2', async () => {
    await psPage.waitForTimeout(1000)
    await screenshot(psPage, '20-ps-round-2-playing')
  })

  test('18 — Player round 2', async () => {
    await expect(playerPage.locator('text=TAP THE SYMBOL')).toBeVisible({ timeout: 5000 })
    await screenshot(playerPage, '21-player-round-2-playing')

    // Tap aggressively
    const buttons = playerPage.locator('button').filter({ hasText: /[▲●■✦]/ })
    for (let i = 0; i < 8; i++) {
      await buttons.nth(i % 4).click()
      await playerPage.waitForTimeout(200)
    }
    await screenshot(playerPage, '22-player-round-2-tapping')
  })

  test('19 — Round 2 ends — final results', async () => {
    await hostPage.waitForTimeout(27_000)

    await expect(hostPage.getByRole('button', { name: 'Next Round' })).toBeVisible({ timeout: 5000 })
    await screenshot(hostPage, '23-host-round-2-ended')

    await psPage.waitForTimeout(1000)
    await screenshot(psPage, '24-ps-round-2-results')

    await expect(playerPage.locator('text=/Nice run|Keep going|Warm up/')).toBeVisible({ timeout: 5000 })
    await screenshot(playerPage, '25-player-round-2-results')
  })
})
