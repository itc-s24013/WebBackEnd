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

export default router