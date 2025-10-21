import express, { Router } from 'express'
import axios from "axios";
import { XMLParser } from "fast-xml-parser";

const router = Router()
const xmlParser = new XMLParser()
const httpClient = axios.create({
    baseURL: 'https://news.google.com',
    transformResponse: [
        data => xmlParser.parse(data)
    ]
})

declare module 'express-session' {
    interface SessionData {
        message?: string
    }
}

router.get('/', async (req, res, next) => {
    const res2 = await httpClient.get('/rss?hl=ja&gl=JP&ceid=JP:ja')
    const result = res2.data

    const data = {
        title: 'Google News',
        content: result.rss.channel.item
    }
    res.render('hello', data)
})

router.post('/post', async (req, res, next) => {
    const msg = req.body.message as string | undefined
    req.session.message = msg
    const data = {
        title: 'Hello',
        content: `あなたは、「${msg}」と送信しました。`
    }
    res.render('hello', data)
})

export default router