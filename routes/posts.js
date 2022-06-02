var express = require('express');
var router = express.Router();
const PostControllers = require('../controllers/posts');
const { isAuth, generateSendJWT } = require('../service/auth');

router.get('/', PostControllers.getPosts); // 取得所有貼文

router.get('/:id', PostControllers.getOnePost); // 取得單一貼文

router.post('/', PostControllers.createdPosts); // 新增貼文

router.get('/user/:id', PostControllers.getPersonalPost); // 取得個人所有貼文列表

router.post('/:id/comment', isAuth, PostControllers.createdComment); // 新增一則貼文的留言

router.post('/:id/like', isAuth, PostControllers.addLike); // 新增一則貼文的讚

router.delete('/:id/unlike', isAuth, PostControllers.removeLike); // 取消一則貼文的讚

router.delete('/', PostControllers.deletePost);

router.delete('/:id', PostControllers.deleteOnePost);

router.patch('/:id', PostControllers.updatePost);

module.exports = router;
