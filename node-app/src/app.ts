import http from "node:http"; // httpを使えるようにするよ
import pug from 'pug';
import url from 'node:url'
import fs from 'node:fs/promises'

const index_template = pug.compileFile('./index.pug') // ファイルはここで読み込む
const style_css = await fs.readFile('style.css', 'utf8')

const server = http.createServer(getFromClient)

server.listen(3210);
console.log('Server start!') // サーバー側に出力される

// ここまでメインプログラム===================

// createServer の処理
async function getFromClient(req: http.IncomingMessage, res: http.ServerResponse) {
    const url_parts = new url.URL(req.url || '', 'http://localhost:3210')

    switch (url_parts.pathname) {
        case '/': {
            // Index(トップページにアクセスが来た時
            const content = index_template({
                title: 'Indexページ',
                content: 'これはテンプレートを使ったシンプルなサンプルページです。'
            })
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
            res.write(content)
            res.end()
            break
        }

        case '/style.css': {
            // スタイルシート(style.css)にアクセスが来た時
            res.writeHead(200, {'Content-Type': 'text/css; charset=utf-8'})
            res.write(style_css)
            res.end()
            break
        }

        default:
            // 想定していないパスへのアクセス
            res.writeHead(404,{'Content-Type': 'text/plain'})
            res.end('no page...')
            break
    }

    /* このプログラムだと毎回ファイルを読み込んでだるいので関数の外で読み込む方法の方が良い
     const content = pug.renderFile('./index.pug', { // 渡す引数が複数個あるので{}でオブジェクト型として渡す
        title: 'Indexページ',
        content: 'これはテンプレートを使ったシンプルなサンプルページです。'
    })
    */
}