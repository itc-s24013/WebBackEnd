import {Router} from 'express'

const router = Router()

/* Get users listing. */
router.get('/login', async (req, res) => {
  res.render('users/login')
})

export default router