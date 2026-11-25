import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('./dist/', import.meta.url))
const port = Number(process.env.PORT ?? 4173)

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', 'http://localhost')
    let pathname = decodeURIComponent(url.pathname)
    if (pathname === '/') pathname = '/index.html'

    let filePath = normalize(join(root, pathname))
    if (!filePath.startsWith(normalize(root))) {
      response.writeHead(403).end('Forbidden')
      return
    }

    let body
    try {
      body = await readFile(filePath)
    } catch {
      // SPA fallback：未知路径返回 index.html，交给前端路由
      filePath = join(root, 'index.html')
      body = await readFile(filePath)
    }

    response.writeHead(200, {
      'Content-Type': mime[extname(filePath).toLowerCase()] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    })
    response.end(body)
  } catch {
    response.writeHead(500).end('Internal Server Error')
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`preview: http://127.0.0.1:${port}`)
})
