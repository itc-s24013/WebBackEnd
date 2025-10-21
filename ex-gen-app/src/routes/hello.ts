import express, { Router } from 'express'

const router = Router()

declare module 'express-session' {
    interface SessionData {
        message?: string
    }
}

router.get('/', async (req, res, next) => {
    const msg = req.session.message !== undefined
        ? `Last Message: ${req.session.message}`
        : '※何か書いて送信してください。'
    // 条件式 ? 真の時の値 : 偽の時の値
    const data = {
        title: 'Hello',
        content: msg
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