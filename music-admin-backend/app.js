const Koa = require('koa')
const app = new Koa()
const Router = require('koa-router')
const router = new Router()
const cors = require('koa2-cors')
// post传递参数 
const koaBody = require('koa-body')

const ENV = 'xly-7wsip'

// 跨域  允许前端跨域
app.use(cors({
  origin: ['http://localhost:9528'],
  credentials: true
}))

// 接收post参数解析
app.use(koaBody({
  // 前端的post参数能传到后端
  multipart: true,
}))

app.use(async (ctx, next) => {
  console.log('全局中间件')
  // ctx.body = 'Hello Wolrd'
  ctx.state.env = ENV
  await next()
})

const playlist = require('./controller/playlist.js')
const swiper = require('./controller/swiper.js')
const blog = require('./controller/blog.js')

router.use('/playlist', playlist.routes())
router.use('/swiper', swiper.routes())
router.use('/blog', blog.routes())

app.use(router.routes())
// 允许路由的get post等方法
app.use(router.allowedMethods())



app.listen(3000, () => {
  console.log('服务开启在3000端口')
})

// MVC