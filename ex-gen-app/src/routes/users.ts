import {Router, Request} from 'express'
import {PrismaMariaDb} from '@prisma/adapter-mariadb'
import {PrismaClient} from 'db'

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
}

router.get('/', async (req: Request<{}, {}, {}, UserPrams>, res, next) => {
    const id = parseInt(req.query.id || '')
    const users = await (id ? prisma.user.findMany({where: {id: {lte: id}}}) // 指定したid以下 less than or equal
        : prisma.user.findMany())

    res.render('users/index', {
        title: 'Users/Index',
        content: users,
    })
})

router.get('/find', async (req: Request<{}, {}, {}, UserPrams>, res, next) => {
    const {name} = req.query
    const min = parseInt(req.query.min || '')
    const max = parseInt(req.query.max || '')

    const users = await prisma.user.findMany({where: {
        AND: [
            {name: {contains: name}},
            {age: {gte: min, lte: max}}, // min以上 max以下
        ]
    }})
    res.render('users/index', {
        title: 'Users/Find',
        content: users
    })
})

export default router