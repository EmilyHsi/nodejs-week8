const express = require('express');
const router = express.Router();
const UserControllers = require('../controllers/users');
const { isAuth, generateSendJWT } = require('../service/auth');

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

router.post('/sign_up', UserControllers.signUp); // 註冊會員

router.post('/sign_in', UserControllers.signIn); // 登入會員

router.post('/updatePassword', isAuth, UserControllers.updatePassword); // 重設密碼

router.get('/profile', isAuth, UserControllers.getProfile); // 取得個人資料

router.patch('/updateProfile', isAuth, UserControllers.updateProfile); // 更新個人資料

router.get('/getLikeList', isAuth, UserControllers.getLikeList); // 取得個人按讚列表

router.post('/:id/follow', isAuth, UserControllers.followUser); // 追蹤朋友

router.delete('/:id/unfollow', isAuth, UserControllers.unfollowUser); // 取消追蹤朋友

router.get('/following', isAuth, UserControllers.followingList); // 取得個人追蹤名單

module.exports = router;
