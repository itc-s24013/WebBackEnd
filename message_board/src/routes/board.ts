import {Router} from 'express'
import prisma from "../libs/db.js";
import {check, validationResult} from 'express-validator'

const router = Router()
const ITEMS_PER_PAGE = 5

router.use(async (req, res, next) => {
  // ログイン中かどうかをチェックするミドルウェア
  if (!req.isAuthenticated()) {
    // 未ログインなので、ログインページにリダイレクト
    res.redirect('/users/login')
    return
  }
  next() // ログイン中なので次の処理へ
})

router.get('/{:page}', async (req, res) => {
  // ページ番号をパスパラメータから取ってくる。取得できない場合のデフォルトは 1
  const page = parseInt(req.params.page || '1')
  const posts = await prisma.post.findMany({
    skip: (page - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
    where: {
      isDeleted: false
    },
    orderBy: [
      {createdAt: 'desc'}
    ],
    include: {
      user: {
        select: {
          id: true,
          name: true,
        }
      }
    }
  })
  const count = await prisma.post.count({
    where: {
      isDeleted: false
    },
  })
  const maxPage = Math.ceil(count / ITEMS_PER_PAGE)
  res.render('board/index', {
    user: req.user,
    posts,
    page,
    maxPage,
  })
})

router.post('/post',
  check('message').notEmpty(),
  async (req, res) => {
    const result = validationResult(req)
    if (result.isEmpty()) {
      // message が入っていたら登録処理
      await prisma.post.create({
        data: {
          userId: req.user?.id as string,
          message: req.body.message,
        }
      })
    }
    return res.redirect('/board')
  }
)

router.get('/user/:userId{/:page}', async (req, res) => {
  const userId = req.params.userId
  const page = parseInt(req.params.page || '1')
  const posts = await prisma.post.findMany({
    skip: (page - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
    where: {
      userId: userId,
      isDeleted: false // 削除したはずの投稿が表示されないようにする
    },
    orderBy: [
      {createdAt: 'desc'} // 新しい投稿順に表示する
    ],
    include: {
      user: {
        select: {
          id: true,
          name: true
        }
      }
    }
  })
  // 特定ユーザーの稿数を取得する
  const count = await prisma.post.count({
    where: {userId, isDeleted: false},
  })
  const maxPage = Math.ceil(count / ITEMS_PER_PAGE) // 全件数から最大ページ数を計算する

  // 特定ユーザーの情報を取得する
  const targetUser = await prisma.user.findUnique({
    select: {
      id: true,
      name: true
    },
    where: {
      id: userId
    }
  })

  // テンプレートに送る情報
  res.render('board/user', {
    user: targetUser, // ログイン中のユーザ情報
    posts, // 投稿一覧// データ
    page, // 現在のページ番号
    maxPage, // 最大ページ番号
  })
})

export default router