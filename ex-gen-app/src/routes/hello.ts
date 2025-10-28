import express, { Router } from 'express'
import mariadb from 'mariadb'
import {check, validationResult} from "express-validator";

const router = Router()
const db = await mariadb.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'example',
    database: 'mydb'
})

interface MyData {
    id: number
    name: string
    mail: string
    age: number
}

router.get('/', async (req, res, next) => {
    const result = await db.query<MyData>('SELECT * FROM mydata')
    res.render('hello/index', {
        title: 'Hello',
        content: result
    })
})

router.get('/add', async (req, res, next) => {
    res.render('hello/add', {
        title: 'Hello/Add',
        content: '新しいレコードを入力',
        form: {name: '', mail: '', age: 0},
        error: {}
    })
})

router.post('/add',
    check('name', 'NAME は必ず入力してください').notEmpty().escape(), // escape()をつけることでHTMLのような特殊文字を無害化することが出来る
    check('mail','MAIL はメールアドレスを入力してください').isEmail().escape(),
    check('age','AGE は年齢(整数)を入力してください').isInt().custom(
        async (value) => { // async で定義しないとエラーメッセージがカスタマイズ出来ない。
            if (!(value >= 0 && value <= 120)) {
                throw new Error('AGE は0以上120以下で入力してください')
            }
        }
    ).escape(),
    async (req, res, next) => {
        const result = validationResult(req)
        if (!result.isEmpty()) { // エラーが出た時(エラーが出てたら空になる)
            // 入力チェックに引っかかったら再レンダリング
            res.render('hello/add', {
                title: 'Hello/Add',
                content: '新しいレコードを入力',
                form: req.body,
                error: result.mapped()
            })
            return
        }
        const { name, mail, age } = req.body
        await db.query('INSERT INTO mydata (name, mail, age) VALUES (?,?,?)', [
            name, mail, age
        ])
        res.redirect('/hello')
    })

router.get('/show', async (req, res, next) => {
    const id = Number(req.query.id)
    const result: MyData[] = await db.query(
        'SELECT * FROM mydata WHERE id = ?',[id])
    res.render('hello/show', {
        title: 'Hello/show',
        content: `id=${id} のレコード`,
        mydata: result[0]
        }
    )
})

router.get('/edit', async (req, res, next) => {
    const id = Number(req.query.id)
    const result: MyData[] = await db.query(
        'SELECT * FROM mydata WHERE id = ?',[id]
    )
    res.render('hello/edit', {
        title: 'Hello/edit',
        content: `id=${id} のレコード`,
        mydata: result[0]
    })
})

router.post('/edit', async (req, res, next) => {
    const {id, name, mail, age} = req.body
    await db.query(
        'UPDATE mydata SET name=?, mail=?, age=? WHERE id = ?',[
            name, mail, age, id
        ])
    res.redirect('/hello')
})

router.get('/delete', async (req, res, next) => {
    const id = Number(req.query.id)
    const result: MyData[] = await db.query(
        'SELECT * FROM mydata WHERE id = ?',[id]
    )
    res.render('hello/delete', {
        title: 'Hello/delete',
        content: `id=${id} のレコード`,
        mydata: result[0]
    })
})

router.post('/delete', async (req, res, next) => {
    const id = Number(req.body.id)
    await db.query('DELETE FROM mydata WHERE id = ?',[id])
    res.redirect('/hello')
})

export default router