import http from "node:http"; // httpを使えるようにするよ
import pug from 'pug';
import url from 'node:url'
import fs from 'node:fs/promises';
import qs from 'node:querystring'

const index_template = pug.compileFile('./index.pug') // ファイルはここで読み込む
const other_template = pug.compileFile('./other.pug')

const server = http.createServer(getFromClient)

server.listen(3210);
console.log('Server start!') // サーバー側に出力される

const data = {
    'Taro': '09-999-999',
    'Hanako': '080-888-888',
    'Sachiko': '070-777-777',
    'Ichiro:': '060-666-666'
}

// ここまでメインプログラム===================

// createServer の処理
async function getFromClient(req: http.IncomingMessage, res: http.ServerResponse) {
    const url_parts = new url.URL(req.url || '', 'http://localhost:3210')

    switch (url_parts.pathname) {
        case '/': {
            await response_index(req, res)
            break
        }

        case '/other': {
            await response_other(req, res)
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

async function response_index(req:http.IncomingMessage, res:http.ServerResponse) {
    const msg = 'これはIndexページです。'
    const content = index_template({
        title: 'Index',
        content: msg,
        data
    })
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
    res.write(content)
    res.end()
}

async function response_other(req:http.IncomingMessage, res:http.ServerResponse) {
    let msg = 'これはOtherページです。'

    if (req.method === 'POST') {
        const post_data = await (new Promise<qs.ParsedUrlQuery>((resolve,reject) => {
            let body = ''
            req.on('data', (chunk) => { // 少しずつ受け取ったデータをchunkとしてbodyに追加する
                body += chunk
            })
            req.on('end', () => {
                try {
                    resolve(qs.parse(body)) // データを整える
                } catch (e) {
                    console.error(e)
                    reject(e)
                }
            })
        }))
        msg += `あなたは「${post_data.msg}」と書きました`
        const content = other_template({
            title: 'Other',
            content: msg,
        })
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
        res.write(content)
        res.end()
    } else {
        // POST以外のアクセス
        const content = other_template({
            title: 'Other',
            content: 'ページがありません',
        })
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
        res.write(content)
        res.end()
    }
}