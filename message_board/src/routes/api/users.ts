import {Router} from 'express'
import passport from '../../libs/auth.js'
import {check, validationResult} from "express-validator";
import prisma from "../../libs/db.js";
import argon2 from "argon2";


const router = Router()


router.post('/login',
  passport.authenticate('local', {
    failureMessage: true,
    badRequestMessage: 'ユーザー名とパスワードを入力してください'
  }),
  async (req, res) => {
    res.json({message: 'login ok'})
  }
)


router.get('/logout', async (req, res) => {
  req.logout(err => {
    if (err) {
      throw err
    }
    res.redirect('/users/login')
  })
})


router.get('/register', async (req, res) => {
  res.render('users/register')
})


router.post('/register',
  check('email').notEmpty().isEmail(),
  check('name').notEmpty(),
  check('password').notEmpty(),
  async (req, res) => {
    const result = validationResult(req)
    if (!result.isEmpty()) {
      req.session.messages = ['登録に失敗しました']
      return res.redirect('/users/register')
    }
    const hashedPassword = await argon2.hash(req.body.password, {
      timeCost: 2,
      memoryCost: 19456,
      parallelism: 1
    })
    const newUser = await prisma.user.create({
      data: {
        email: req.body.email,
        name: req.body.name,
        password: hashedPassword
      }
    })
    const user: Express.User = {id: newUser.id, name: newUser.name}
    req.login(user, err => {
      if (err) {
        throw err
      }
      res.redirect('/board')
    })
  })
export default router
