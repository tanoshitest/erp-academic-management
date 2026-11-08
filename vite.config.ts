import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { createSeedState } from './src/data/seed'
import { buildMuseDatasets, MUSE_DATASETS } from './src/services/museExport'

// Publishes the seed data as static JSON at /api/muse/<dataset>.json so Muse can pull a stable URL.
function museEndpoints(): Plugin {
  const datasets = () => buildMuseDatasets(createSeedState())
  return {
    name: 'muse-endpoints',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const match = req.url?.match(/^\/api\/muse\/([a-z]+)\.json/)
        const key = match?.[1] as keyof ReturnType<typeof datasets> | undefined
        if (!key || !MUSE_DATASETS.includes(key)) return next()
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify(datasets()[key], null, 2))
      })
    },
    generateBundle() {
      const all = datasets()
      for (const key of MUSE_DATASETS) {
        this.emitFile({ type: 'asset', fileName: `api/muse/${key}.json`, source: JSON.stringify(all[key], null, 2) })
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), museEndpoints()],
})
