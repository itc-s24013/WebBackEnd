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
}

router.get('/', async (req: Request<{}, {}, {}, UserPrams>, res, next) => {
    const id = parseInt(req.query.id || '')
    const users = await (id ? prisma.user.findMany({where: {id}}) // {id: id} 変数名とキー名が同じ場合は省略可能
        : prisma.user.findMany())

    res.render('users/index', {
        title: 'Users/Index',
        content: users,
    })
})

export default router