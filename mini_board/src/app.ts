import http from 'node:http'
import fs from 'node:fs/promises'
import pug from 'pug'
import { URL } from 'node:url'
import qs from 'node:querystring'
import path from 'node:path'
import * as console from "node:console";


// pug テンプレートをコンパイルして準備しておく
const pugIndex = pug.compileFile(path.join(import.meta.dirname, 'index.pug'))
const pugLogin = pug.compileFile(path.join(import.meta.dirname, 'login.pug'))

// メッセージの最大保管数
const MAX_MESSAGE = 10
// メッセージを保存するファイル名
const DATA_FILENAME = "mydata.txt"

// メッセージデータを入れておく変数
const messageData: Array<{id: string, msg: string}> = await readFromFile(
    path.join(import.meta.dirname, DATA_FILENAME),
)

// Server オブジェクト作成
const server = http.createServer(getFromClient)
// 接続待ち受け
server.listen(3210)
console.log('Server start!')

// ここから各関数の定義
async function getFromClient(
    req: http.IncomingMessage,
    res: http.ServerResponse
) {
    const url = URL.parse(req.url || '', 'http://localhost:3210')

    switch (url?.pathname) {
        case '/':
            await responseIndex(req, res)
            break
        case '/login':
            await responseLogin(req, res)
            break
        default:
            res.writeHead(404, {'Content-Type': 'text/plain'})
            res.end('not found page ...')
            break
    }
}

// login の処理
async function responseLogin(
    _req: http.IncomingMessage,
    res: http.ServerResponse
) {
    const content = pugLogin()
    res.writeHead(200, {'Content-Type': 'text/html charset=utf-8'})
    res.write(content)
    res.end()
}

// / の処理
async function responseIndex(
    req: http.IncomingMessage,
    res: http.ServerResponse
) {
    // POST ではないアクセス時
    if (req.method !== 'POST') {
        // テンプレートをレンダリングして返して終わり
        const content = pugIndex({
            data: messageData
        })
        res.writeHead(200, {'Content-Type': 'text/html charset=utf-8'})
        res.write(content)
        res.end()
        return // if文を通った場合処理を終えたら終了する
    }

    // POST アクセス時 (if文を通らない場合はここ)
    const postData = await parseBody(req)
    await addToData(postData.id, postData.msg, DATA_FILENAME)

    // リダイレクト
    res.writeHead(302, "Found", {
        Location: '/',
    })
    res.end()
}

// リクエストボディをパースする関数
async function parseBody(req: http.IncomingMessage) {
    return new Promise<{id: string, msg: string}>((resolve, reject):void => {
        let body = ''
        req.on('data', chunk => body += chunk)
        req.on('end', () => {
            const parsed = qs.parse(body)
            resolve({id: String(parsed.id), msg: String(parsed.msg)})
        })
    })
}

// 指定された名前のファイルを読み込んでメッセージデータを取り出す
async function readFromFile(filename: string) {
    // 関数内で必要な変数を準備
    let fd: fs.FileHandle | null = null
    let result: Array<{ id: string; msg: string }> = []

    try {
        fd = await fs.open(filename, 'a+')
        result = (await fs.readFile(fd, 'utf8'))
            .split('\n')
            .filter(v => v.length > 0)
            .map<{id: string, msg: string}>(s => JSON.parse(s))
    } catch (err) {
        console.error(err)
    } finally {
        await fd?.close() // fd が null だったら何もしないで終了する
    }
    return result
}

// データを更新
async function addToData(id: string, msg: string, fileName: string) {
    messageData.unshift({id, msg})
    if (messageData.length > MAX_MESSAGE) {
        messageData.pop() // unshift で入れたのとは逆から取り出す
    }
    await saveToFile(fileName)
}

// データを保存
async function saveToFile(filename: string) {
    const filepath = path.join(import.meta.dirname, filename)
    const data = messageData.map(m=> JSON.stringify(m)).join('\n') // データをJson形式で追加して改行

    try {
        await fs.writeFile(filepath, data)
    } catch (err) {
        console.log(err)
    }
}