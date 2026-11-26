import { exec } from 'node:child_process'
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

const server = createServer(async (request, response) => {
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
})

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`端口 ${port} 已被占用。换个端口：set PORT=4174 && node serve.mjs --open`)
    process.exit(1)
  }
  throw error
})

server.listen(port, '127.0.0.1', () => {
  const url = `http://127.0.0.1:${port}`
  console.log(`preview: ${url}`)
  if (process.argv.includes('--open')) {
    const command =
      process.platform === 'win32'
        ? `start "" "${url}"`
        : process.platform === 'darwin'
          ? `open "${url}"`
          : `xdg-open "${url}"`
    try {
      exec(command, () => {})
    } catch {
      console.log(`没能自动打开浏览器，请手动访问：${url}`)
    }
  }
})
