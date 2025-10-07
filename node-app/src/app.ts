import http from "node:http"; // httpを使えるようにするよ
import pug from 'pug';

const server = http.createServer(getFromClient)

server.listen(3210);
console.log('Server start!') // サーバー側に出力される

// ここまでメインプログラム===================

// createServer の処理
async function getFromClient(req: http.IncomingMessage, res: http.ServerResponse) {
    const content = pug.renderFile('./index.pug')
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
    res.write(content)
    res.end()
}