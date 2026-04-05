/**
 * Simulates players joining a Symbol Rush room.
 *
 * Usage:
 *   node scripts/simulate-players.mjs              # creates room + 8 players
 *   node scripts/simulate-players.mjs ABCDEF       # joins existing room with 8 players
 *   node scripts/simulate-players.mjs ABCDEF 20    # joins existing room with 20 players
 */

const WS_URL = 'ws://localhost:3000/api/ws'
const ROOM_CODE = process.argv[2] || null
const PLAYER_COUNT = parseInt(process.argv[3] || '8', 10)

const NAMES = [
  'Alice', 'Bob', 'Charlie', 'Diana', 'Ethan', 'Fiona', 'Gus', 'Hannah',
  'Ivan', 'Julia', 'Kevin', 'Luna', 'Max', 'Nora', 'Oscar', 'Priya',
  'Quinn', 'Rosa', 'Sam', 'Tina', 'Uma', 'Vic', 'Wendy', 'Xander',
  'Yuki', 'Zara', 'Leo', 'Mia', 'Ash', 'Bea',
]

function connect() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WS_URL)
    ws.onopen = () => resolve(ws)
    ws.onerror = (e) => reject(e)
  })
}

function send(ws, msg) {
  ws.send(JSON.stringify(msg))
}

function waitFor(ws, type) {
  return new Promise((resolve) => {
    const handler = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === type) {
        ws.removeEventListener('message', handler)
        resolve(data)
      }
    }
    ws.addEventListener('message', handler)
  })
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function main() {
  let roomCode = ROOM_CODE

  // If no room code provided, create one as host
  if (!roomCode) {
    console.log('🎮 Creating room as host...')
    const host = await connect()
    send(host, { type: 'host:create-room' })
    const created = await waitFor(host, 'room:created')
    roomCode = created.roomCode
    console.log(`✅ Room created: ${roomCode}`)
    console.log(`   Public Screen: http://localhost:3000/ps/${roomCode}`)
    console.log(`   Host Panel:    http://localhost:3000/host`)
    console.log('')

    // Keep host alive
    host.onclose = () => console.log('⚠️  Host disconnected')
  }

  console.log(`👥 Adding ${PLAYER_COUNT} players to room ${roomCode}...\n`)

  const players = []

  for (let i = 0; i < PLAYER_COUNT; i++) {
    const name = NAMES[i % NAMES.length] + (i >= NAMES.length ? `${Math.floor(i / NAMES.length) + 1}` : '')
    const delay = 300 + Math.random() * 700 // stagger joins 300-1000ms

    await sleep(delay)

    try {
      const ws = await connect()
      send(ws, { type: 'player:join', roomCode, username: name })
      const status = await waitFor(ws, 'room:status')
      console.log(`  ✅ ${name} joined (${status.playerCount} players)`)
      players.push({ ws, name })
    } catch (e) {
      console.log(`  ❌ ${name} failed to join`)
    }
  }

  console.log(`\n🎉 All ${players.length} players connected!`)
  console.log('   Press Ctrl+C to disconnect all players.\n')

  // Keep script alive
  process.on('SIGINT', () => {
    console.log('\n👋 Disconnecting all players...')
    players.forEach(p => p.ws.close())
    process.exit(0)
  })
}

main().catch(console.error)
