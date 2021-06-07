import { build } from 'esbuild'
import fastGlob from 'fast-glob'
import { remove } from 'fs-extra'
import { mkdir } from 'fs/promises'
import path from 'path'

import { fileURLToPath } from 'url'

const directoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../')
const directoryTests = path.join(directoryRoot, 'lib/tests')
const directorySrc = path.join(directoryRoot, 'src')

await remove(directoryTests)
await mkdir(directoryTests, { recursive: true })

const entryPoints = await fastGlob(['**/*.spec.?(m)(j|t)s?(x)'], {
  absolute: true,
  cwd: directorySrc,
  dot: true
})

process.cwd(directoryRoot)

await build({
  entryPoints,
  sourcemap: true,
  bundle: true,
  platform: 'node',
  target: 'node14.17.0',
  format: 'esm',
  outbase: directorySrc,
  outdir: directoryTests,
  // external: ['sinon', 'chai', 'chai-as-promised'],
  mainFields: ['module', 'main'],
  logLevel: 'info'
})
