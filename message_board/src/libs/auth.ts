import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import argon2 from 'argon2';
import prisma from './db.js'

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (username, password, done) => {
  try {
    // ユーザー情報をとってくる
    const user = await prisma.user.findUnique({where: {email: username}});
    if (!user) {
      // ユーザー情報がないということはログイン失敗
      return done(null, false,
        { message: 'メールアドレスまたはパスワードが違います'}
      )
    }
    if (!await argon2.verify(user.password, password)) {
      // パスワードのハッシュ値が異なるのでログイン失敗
      return done(null, false,
        {message: 'メールアドレスまたはパスワードが違います'}
      )
    }
    return done(null, {id: user.id, name: user.name})
  } catch (e) {
    return done(e)
  }
}))

// セッションストレージにユーザー情報を保存する際の処理
passport.serializeUser<Express.User>((user, done) => {
  process.nextTick(() => {
    done(null, user)
  })
})

// セッションストレージから serializeUser 関数によって保存されたユーザー情報をとってきた直後になにかする設定
passport.deserializeUser<Express.User>((user, done) => {
  process.nextTick(() => {
    done(null, user)
  })
})

export default passport