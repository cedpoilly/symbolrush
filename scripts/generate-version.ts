import { execFileSync } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

function git(...args: string[]): string {
  try {
    return execFileSync('git', args, { encoding: 'utf-8' }).trim()
  }
  catch {
    return ''
  }
}

const commit = process.env.BUILD_COMMIT || git('rev-parse', 'HEAD')
const commitShort = process.env.BUILD_COMMIT?.slice(0, 7) || git('rev-parse', '--short', 'HEAD')
const branch = process.env.BUILD_BRANCH || git('rev-parse', '--abbrev-ref', 'HEAD')
const version = process.env.BUILD_VERSION || '0.0.0-dev'

let commits: { sha: string; message: string; date: string; author: string }[] = []
if (process.env.BUILD_COMMITS) {
  try {
    commits = JSON.parse(process.env.BUILD_COMMITS)
  }
  catch { /* ignore parse errors */ }
}
else {
  const log = git('log', '-10', '--format=%h\t%s\t%aI\t%an')
  if (log) {
    commits = log.split('\n').filter(Boolean).map((line) => {
      const parts = line.split('\t')
      return { sha: parts[0] ?? '', message: parts[1] ?? '', date: parts[2] ?? '', author: parts[3] ?? '' }
    })
  }
}

const info = {
  commit,
  commitShort,
  branch,
  version,
  builtAt: new Date().toISOString(),
  commits,
}

const outDir = resolve(import.meta.dirname, '..', 'server', 'generated')
mkdirSync(outDir, { recursive: true })
writeFileSync(resolve(outDir, 'version.json'), JSON.stringify(info, null, 2))

console.log(`Version info generated: ${version} (${commitShort})`)
