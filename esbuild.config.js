import fs from 'fs/promises'
import esbuild from 'esbuild'
import packageJson from './package.json' with { type: 'json' }

const externalDeps = [
  ...Object.keys(packageJson.peerDependencies ?? {}),
  ...Object.keys(packageJson.dependencies ?? {})
]

const buildFormats = [
  {
    format: 'esm',
    outfile: 'dist/esm/index.mjs',
    platform: 'node'
  },
  {
    format: 'cjs',
    outfile: 'dist/cjs/index.cjs',
    platform: 'node'
  }
]

async function updateVersionFile() {
  const versionFilePath = './src/version.json'
  const packageVersion = packageJson.version
  const majorVersion = parseInt(packageVersion.split('.')[0])

  let existingVersion = null
  let shouldUpdateTimestamp = true

  try {
    // Read existing version file
    const existingContent = await fs.readFile(versionFilePath, 'utf8')
    const existingVersionData = JSON.parse(existingContent)
    existingVersion = existingVersionData.version

    // Only update timestamp if version has changed
    shouldUpdateTimestamp = existingVersion !== packageVersion
  } catch (error) {
    // File doesn't exist or is invalid, we'll create a new one
    console.log('Version file not found or invalid, creating new one...', error)
  }

  const versionData = {
    version: packageVersion,
    year: majorVersion,
    lastUpdated: shouldUpdateTimestamp
      ? new Date().toISOString()
      : (existingVersion?.lastUpdated ?? new Date().toISOString())
  }

  // Read existing file again to preserve lastUpdated if version hasn't changed
  if (!shouldUpdateTimestamp) {
    try {
      const existingContent = await fs.readFile(versionFilePath, 'utf8')
      const existingVersionData = JSON.parse(existingContent)
      versionData.lastUpdated = existingVersionData.lastUpdated
    } catch (error) {
      // If we can't read existing file, use current timestamp
      versionData.lastUpdated = new Date().toISOString()
    }
  }

  await fs.writeFile(
    versionFilePath,
    JSON.stringify(versionData, null, 2) + '\n'
  )

  if (shouldUpdateTimestamp) {
    console.log(
      `✅ Version updated: ${existingVersion || 'none'} → ${packageVersion}`
    )
  } else {
    console.log(
      `📦 Version unchanged: ${packageVersion} (keeping existing timestamp)`
    )
  }
}

function buildForFormat({ format, outfile, platform }) {
  return esbuild.build({
    entryPoints: ['./src/index.ts'],
    bundle: true,
    outfile,
    platform,
    format,
    sourcemap: true,
    target: 'node20',
    minify: true,
    treeShaking: true,
    external: externalDeps,
    metafile: true,
    plugins: [
      {
        name: 'log-bundle-size',
        setup(build) {
          build.onEnd(async () => {
            const { size } = await fs.stat(outfile)
            const sizeInMB = (size / (1024 * 1024)).toFixed(2)
            console.log(
              `\n[${format.toUpperCase()}] ${outfile}: ${sizeInMB} MB`
            )
          })
        }
      }
    ]
  })
}

async function buildAll() {
  // Update version file before building
  await updateVersionFile()

  for (const { format, outfile, platform } of buildFormats) {
    const result = await buildForFormat({ format, outfile, platform })
    // Output analysis to console
    console.log(await esbuild.analyzeMetafile(result.metafile))
  }
}

if (process.argv.includes('--watch')) {
  // Watch mode - update version file and build the first format
  updateVersionFile().then(() => {
    buildForFormat(buildFormats[0]).then((context) => {
      context.watch()
      console.log('Watching for changes...')
    })
  })
} else {
  // Build mode with analysis
  buildAll().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
