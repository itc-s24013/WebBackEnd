import {Router} from 'express'
import passport from '../libs/auth.js'
import {check, validationResult} from "express-validator";
import prisma from "../libs/db.js";
import argon2 from "argon2";

const router = Router()

/* Get users listing. */
router.get('/login', async (req, res) => {
  res.render('users/login', {
    error: (req.session.messages || []).pop()
  })
})

router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/board',
    failureRedirect: '/users/login',
    failureMessage: true,
    badRequestMessage: 'ユーザー名とパスワードを入力してください'
  }))

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
    console.log("hashing password")
    const hashedPassword = await argon2.hash(req.body.password, {
      timeCost: 2,
      memoryCost: 19456,
      parallelism: 1
    })
    console.log("password hashed")
    console.log("new user create start")
    const newUser = await prisma.user.create({
      data: {
        email: req.body.email,
        name: req.body.name,
        password: hashedPassword
      }
    })
    console.log("new user created:")
    const user: Express.User = {id: newUser.id, name: newUser.name}
    req.login(user, err => {
      if (err) {
        throw err
      }
      res.redirect('/board')
    })
  })

export default router