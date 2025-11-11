import {Router} from 'express'
import passport from '../libs/auth.js'

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

export default router