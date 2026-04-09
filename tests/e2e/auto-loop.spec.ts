import { test, expect, type Page, type BrowserContext } from '@playwright/test'

const MOBILE = { width: 390, height: 844 }
const PS_HD = { width: 1280, height: 720 }

/** Connect a WebSocket player and return a handle to read messages */
function connectPlayer(page: Page, roomCode: string, username: string) {
  return page.evaluate(
    async ({ code, name }) => {
      return new Promise<boolean>((resolve) => {
        const ws = new WebSocket(`ws://${window.location.host}/api/ws`)
        ws.onopen = () => ws.send(JSON.stringify({ type: 'player:join', roomCode: code, username: name }))
        ws.onmessage = (e) => {
          if (JSON.parse(e.data).type === 'room:status') resolve(true)
        }
        setTimeout(() => resolve(false), 3000)
      })
    },
    { code: roomCode, name: username },
  )
}

test.describe('Auto-loop — manual mode (default)', () => {
  let hostContext: BrowserContext
  let hostPage: Page
  let roomCode: string

  test.beforeAll(async ({ browser }) => {
    hostContext = await browser.newContext({ viewport: MOBILE })
    hostPage = await hostContext.newPage()
  })

  test.afterAll(async () => {
    await hostContext.close()
  })

  test('host creates room in manual mode by default', async () => {
    await hostPage.goto('/host')
    await hostPage.waitForTimeout(3000)

    const codeEl = hostPage.locator('.room-code')
    await expect(codeEl).toBeVisible()
    roomCode = (await codeEl.textContent())!.trim()
    expect(roomCode).toMatch(/^[A-Z0-9]{6}$/)

    // Auto-loop toggle should be visible and OFF
    const autoLoopSwitch = hostPage.locator('text=Auto-loop').locator('..')
    await expect(autoLoopSwitch).toBeVisible()
  })

  test('round does not auto-start without players', async () => {
    // Wait 3 seconds — no round should start
    await hostPage.waitForTimeout(3000)
    await expect(hostPage.locator('text=Current symbol')).not.toBeVisible()
  })

  test('after manual round, no auto-loop countdown appears', async () => {
    // Add a player
    await connectPlayer(hostPage, roomCode, 'Alice')
    await hostPage.waitForTimeout(500)

    // Start round manually
    await hostPage.getByRole('button', { name: 'Start Round' }).click()
    await hostPage.waitForTimeout(1500)
    await expect(hostPage.locator('text=Current symbol')).toBeVisible()

    // Wait for round to end (30s)
    await hostPage.waitForTimeout(30_000)

    // Should show Next Round button, but NO countdown
    await expect(hostPage.getByRole('button', { name: 'Next Round' })).toBeVisible({ timeout: 5000 })
    await expect(hostPage.locator('text=Next round in')).not.toBeVisible()
  })
})

test.describe('Auto-loop — enabled via query param', () => {
  let hostContext: BrowserContext
  let psContext: BrowserContext
  let hostPage: Page
  let psPage: Page
  let roomCode: string

  test.beforeAll(async ({ browser }) => {
    hostContext = await browser.newContext({ viewport: MOBILE })
    psContext = await browser.newContext({ viewport: PS_HD })
    hostPage = await hostContext.newPage()
    psPage = await psContext.newPage()
  })

  test.afterAll(async () => {
    await hostContext.close()
    await psContext.close()
  })

  test('host creates room with autoloop=true', async () => {
    await hostPage.goto('/host?autoloop=true')
    await hostPage.waitForTimeout(3000)

    const codeEl = hostPage.locator('.room-code')
    await expect(codeEl).toBeVisible()
    roomCode = (await codeEl.textContent())!.trim()

    // Auto-loop should show as enabled
    await expect(hostPage.locator('text=Auto-loop')).toBeVisible()
    await expect(hostPage.locator('text=Rounds run automatically')).toBeVisible()
  })

  test('public screen connects', async () => {
    await psPage.goto(`/ps/${roomCode}`)
    await psPage.waitForTimeout(2000)
  })

  test('host starts first round manually', async () => {
    await connectPlayer(hostPage, roomCode, 'Bob')
    await hostPage.waitForTimeout(500)

    await hostPage.getByRole('button', { name: 'Start Round' }).click()
    await hostPage.waitForTimeout(1500)
    await expect(hostPage.locator('text=Current symbol')).toBeVisible()
  })

  test('after round ends, countdown appears on host', async () => {
    // Wait for round to end
    await hostPage.waitForTimeout(30_000)

    // Auto-loop countdown should appear
    await expect(hostPage.locator('text=Next round in')).toBeVisible({ timeout: 5000 })
  })

  test('countdown appears on public screen', async () => {
    await expect(psPage.locator('text=Next round in')).toBeVisible({ timeout: 5000 })
  })

  test('next round starts automatically after countdown', async () => {
    // Wait for the 25-second pause to complete + buffer
    await hostPage.waitForTimeout(27_000)

    // Round 2 should have auto-started
    await expect(hostPage.locator('text=Current symbol')).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Auto-loop — toggle mid-session', () => {
  let hostContext: BrowserContext
  let hostPage: Page
  let roomCode: string

  test.beforeAll(async ({ browser }) => {
    hostContext = await browser.newContext({ viewport: MOBILE })
    hostPage = await hostContext.newPage()
  })

  test.afterAll(async () => {
    await hostContext.close()
  })

  test('start in manual mode, play a round', async () => {
    await hostPage.goto('/host')
    await hostPage.waitForTimeout(3000)

    const codeEl = hostPage.locator('.room-code')
    roomCode = (await codeEl.textContent())!.trim()

    await connectPlayer(hostPage, roomCode, 'Charlie')
    await hostPage.waitForTimeout(500)

    await hostPage.getByRole('button', { name: 'Start Round' }).click()
    await hostPage.waitForTimeout(31_000)

    await expect(hostPage.getByRole('button', { name: 'Next Round' })).toBeVisible({ timeout: 5000 })
  })

  test('toggle auto-loop ON — countdown starts', async () => {
    // Find and click the auto-loop switch
    const switchEl = hostPage.locator('[role="switch"]')
    await switchEl.click()
    await hostPage.waitForTimeout(1000)

    // Countdown should appear
    await expect(hostPage.locator('text=Next round in')).toBeVisible({ timeout: 5000 })
  })

  test('toggle auto-loop OFF — countdown stops', async () => {
    const switchEl = hostPage.locator('[role="switch"]')
    await switchEl.click()
    await hostPage.waitForTimeout(1000)

    // Countdown should disappear
    await expect(hostPage.locator('text=Next round in')).not.toBeVisible()
  })

  test('manual start still works after toggling', async () => {
    await hostPage.getByRole('button', { name: 'Next Round' }).click()
    await hostPage.waitForTimeout(1500)
    await expect(hostPage.locator('text=Current symbol')).toBeVisible()
  })
})

test.describe('Auto-loop — maxRounds limit', () => {
  let hostContext: BrowserContext
  let hostPage: Page

  test.beforeAll(async ({ browser }) => {
    hostContext = await browser.newContext({ viewport: MOBILE })
    hostPage = await hostContext.newPage()
  })

  test.afterAll(async () => {
    await hostContext.close()
  })

  test('auto-loop stops after maxRounds', async () => {
    // Create room with autoLoop + maxRounds via WebSocket directly
    const roomCode = await hostPage.evaluate(async () => {
      return new Promise<string>((resolve) => {
        const ws = new WebSocket(`ws://${window.location.host}/api/ws`)
        ws.onopen = () => {
          ws.send(JSON.stringify({
            type: 'host:create-room',
            config: {
              autoLoop: true,
              maxRounds: 2,
              sessionDurationMs: 5_000,
              pauseBetweenRoundsMs: 3_000,
            },
          }))
        }
        ws.onmessage = (e) => {
          const msg = JSON.parse(e.data)
          if (msg.type === 'room:created') {
            // Store ws on window for later use
            ;(window as any).__testWs = ws
            resolve(msg.roomCode)
          }
        }
      })
    })

    // Add a player
    await connectPlayer(hostPage, roomCode, 'Diana')
    await hostPage.waitForTimeout(500)

    // Start round 1 via WS
    await hostPage.evaluate(() => {
      ;(window as any).__testWs.send(JSON.stringify({ type: 'host:start-session' }))
    })

    // Wait for round 1 to end (5s) + pause (3s) + round 2 (5s) + buffer
    await hostPage.waitForTimeout(15_000)

    // After round 2 ends, check that no more rounds start
    // Wait the pause duration + extra — no round 3 should start
    const gotRound3 = await hostPage.evaluate(() => {
      return new Promise<boolean>((resolve) => {
        const ws = (window as any).__testWs as WebSocket
        const handler = (e: MessageEvent) => {
          const msg = JSON.parse(e.data)
          if (msg.type === 'session:started') {
            ws.removeEventListener('message', handler)
            resolve(true)
          }
        }
        ws.addEventListener('message', handler)
        // Wait 8 seconds — if no session:started arrives, maxRounds worked
        setTimeout(() => {
          ws.removeEventListener('message', handler)
          resolve(false)
        }, 8000)
      })
    })

    expect(gotRound3).toBe(false)
  })
})

test.describe('Auto-loop — idle auto-start safety net', () => {
  let hostContext: BrowserContext
  let hostPage: Page

  test.beforeAll(async ({ browser }) => {
    hostContext = await browser.newContext({ viewport: MOBILE })
    hostPage = await hostContext.newPage()
  })

  test.afterAll(async () => {
    await hostContext.close()
  })

  test('round auto-starts after idle timeout with players connected', async () => {
    // Create room with a short autoStartDelayMs for testing
    const result = await hostPage.evaluate(async () => {
      return new Promise<{ roomCode: string; autoStarted: boolean }>((resolve) => {
        const ws = new WebSocket(`ws://${window.location.host}/api/ws`)
        ws.onopen = () => {
          ws.send(JSON.stringify({
            type: 'host:create-room',
            config: {
              autoStartDelayMs: 5_000,
              sessionDurationMs: 5_000,
            },
          }))
        }
        let roomCode = ''
        let playerJoined = false
        ws.onmessage = (e) => {
          const msg = JSON.parse(e.data)
          if (msg.type === 'room:created') {
            roomCode = msg.roomCode
            // Join a player
            const playerWs = new WebSocket(`ws://${window.location.host}/api/ws`)
            playerWs.onopen = () => {
              playerWs.send(JSON.stringify({ type: 'player:join', roomCode, username: 'AutoBot' }))
            }
            playerWs.onmessage = () => {
              if (!playerJoined) playerJoined = true
            }
          }
          if (msg.type === 'session:started') {
            // Auto-start fired!
            resolve({ roomCode, autoStarted: true })
          }
        }
        // Timeout: if no auto-start after 10s, fail
        setTimeout(() => resolve({ roomCode, autoStarted: false }), 10_000)
      })
    })

    expect(result.autoStarted).toBe(true)
  })
})
