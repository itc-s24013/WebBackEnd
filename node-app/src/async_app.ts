import http from "node:http";
import fs from 'node:fs/promises'

const server = http.createServer(
    async (request, response) => { // 途中で止まる可能性を示唆することで関数の外のプログラムの実行を促す
        const data = await fs.readFile('./home.html') // awaitはファイル読み込みを待つ
        response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
        response.write(data)
        response.end()
    }
)