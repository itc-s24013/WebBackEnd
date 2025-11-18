import createError from 'http-errors'
import express, {NextFunction, Request, Response} from 'express'
import path from 'node:path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import session from "express-session";
import {RedisStore} from 'connect-redis'
import {createClient} from 'redis'
import {cdate} from 'cdate'


// 拡張した Passport （認証）
import passport from './libs/auth.js'


// ルーティング設定
import indexRouter from './routes/index.js'
import usersRouter from './routes/users.js'
import boardRouter from './routes/board.js'


// API 用ルーター
import boardApiRouter from './routes/api/board.js'
import userApiRouter from './routes/api/users.js'




const app = express()


const redisClient = await createClient({url: process.env.REDIS_URL})
  .on('error', (err: Error) => console.error(err))
  .connect()
const redisStore = new RedisStore({ client: redisClient })


// view engine setup
app.set('views', path.join(import.meta.dirname, 'views'))
app.set('view engine', 'pug')


// 各種ミドルウェアを登録
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
app.use(express.static(path.join(import.meta.dirname, 'public')))
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret key',
  resave: false,
  saveUninitialized: false,
  name: 'md_sid',
  cookie: {
    maxAge: 1000 * 60 * 60, // 1時間
    httpOnly: true,
  },
  store: redisStore // Redis ストアを使用 = セッションデータを Redis に保存
}))
app.use(passport.authenticate('session'))


// テンプレートから参照した変数や関数を登録する
app.locals.dateFormat = (dt:Date) => cdate(dt)
  .tz('Asia/Tokyo')
  .format('YYYY/MM/DD HH:mm:ss.SSS') // .SSS = ミリ秒まで


// ルーティング設定
app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/board', boardRouter)
// API 用ルーター
app.use('/api/board', boardApiRouter)
app.use('/api/users', userApiRouter)


// 想定外のパスへアクセスがあった場合の処理
app.use(async (req: Request, res: Response, next: NextFunction) => {
  throw createError(404)
})


// エラーの種類で処理を分岐させる
app.use(async (err: unknown, req: Request, res: Response, next: NextFunction) => {
  // set locals, only providing error in development
  res.locals.message = hasProperty(err, 'message') && err.message || 'Unknown error'
  res.locals.error = req.app.get('env') === 'development' ? err : {}


  // render the error page
  res.status(hasProperty(err, 'status') && Number(err.status) || 500)
  res.render('error')
})


// unknown 型のデータが、指定のプロパティを持っているかチェックするための関数
function hasProperty<K extends string>(x: unknown, ...name: K[]): x is { [M in K]: unknown } {
  return (
    x instanceof Object && name.every(prop => prop in x)
  )
}


export default app
