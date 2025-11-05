import {Router, Request} from 'express'
import {PrismaMariaDb} from '@prisma/adapter-mariadb'
import {Prisma, PrismaClient} from 'db'

const router = Router()
const adapter = new PrismaMariaDb({
    host: 'localhost',
    port: 3306,
    user: 'prisma',
    password: 'prisma',
    database: 'chap6',
    connectionLimit: 5
})
const prisma = new PrismaClient({adapter})

interface UserPrams {
    id?: string
    name?: string
    min?: string
    max?: string
    mail?: string
    page?: string
    prev?: string
    next?: string
}

const PAGE_SIZE = 3

router.get('/', async (req: Request<{}, {}, {}, UserPrams>, res, next) => {
    const conditions: Prisma.UserFindManyArgs = {
        orderBy: [
            {id: 'asc'},
        ],
        take: PAGE_SIZE
    }
    const {prev: prevCursor, next: nextCursor} = req.query
    if (nextCursor) {
        conditions.cursor = {id: parseInt(nextCursor)}
        conditions.skip = 1 // skipでカーソルの分を飛ばす
    }
    if (prevCursor) {
        // 戻るボタンのときは take をマイナスにすると逆順で遡ってとってきてくれる
        conditions.take = -PAGE_SIZE
        conditions.cursor = {id: parseInt(prevCursor)}
        conditions.skip = 1
    }
    const users = await prisma.user.findMany(conditions)
    res.render('users/index', {
        title: 'Users/Index',
        content: users,
    })
})

router.get('/find', async (req: Request<{}, {}, {}, UserPrams>, res, next) => {
    const {name, mail} = req.query

    const users = await prisma.user.findMany({where: {
        OR: [
            {name: {contains: name}},
            {mail: {contains: mail}}, // min以上 max以下
        ]
    }})
    res.render('users/index', {
        title: 'Users/Find',
        content: users
    })
})

router.get('/add', async (req, res, next) => {
    res.render('users/add', {
        title: 'Users/Add',
    })
})

router.post('/add', async (req, res, next)=> {
    const {name, pass, mail} = req.body
    const age = parseInt(req.body.age)
    await prisma.user.create({
        data: {name, pass, mail, age}
    })
    res.redirect('/users')
})

router.get('/edit/:id', async (req, res, next) => {
    const id = parseInt(req.params.id)
    const user = await prisma.user.findUnique({where: {id}})
    res.render('users/edit', {
        title: 'Users/Edit',
        user
    })
})

router.post('/edit', async (req, res, next) => {
    const id = parseInt(req.body.id)
    const {name, pass, mail} = req.body
    const age = parseInt(req.body.age)
    await prisma.user.update({
        where: {id},
        data: {name, pass, mail, age}
    })
    res.redirect('/users')
})

router.get('/delete/:id', async (req, res, next) => {
    const id = parseInt(req.params.id)
    const user = await prisma.user.findUnique({where: {id}})
    res.render('users/delete', {
        title: 'Users/Delete',
        user
    })
})

router.post('/delete', async (req, res, next) => {
    const id = parseInt(req.body.id)
    await prisma.user.delete({
        where: {id}
    })
    res.redirect('/users')
})

export default router