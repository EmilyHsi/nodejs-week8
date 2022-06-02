const appError = require('../service/appError');
const handleSuccess = require('../service/handleSuccess');
const handleErrorAsync = require('../service/handleErrorAsync');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const mongoose = require('mongoose');
const User = require('../model/user');
const Post = require('../model/post');
const { isAuth, generateSendJWT } = require('../service/auth');

const users = {
  // 註冊
  signUp: handleErrorAsync(async (req, res, next) => {

    let { email, password, confirmPassword, name } = req.body;
    const user = await User.findOne({ email }); 
    
    // 內容不可為空
    if (!email || !password || !confirmPassword || !name) {
      return appError('400', '欄位未填寫正確', next);
    }
    
    // 暱稱至少2字元
    if (!validator.isLength(name, { min: 2 })) {
      return appError('400', '暱稱至少 2 個字元以上', next);
    }
    
    // 帳號重複
    if (user) {
      return appError('400', '帳號已被註冊，請替換新的 Email！', next);
    }
    
    // 是否為 Email
    if (!validator.isEmail(email)) {
      return appError('400', 'Email 格式不正確', next);
    }
    
    // 密碼正確
    if (password !== confirmPassword) {
      return appError('400', '密碼不一致', next);
    }

    // 密碼 8 碼以上並中英混合
    const passwordReg = '^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,20}$';
    if (!validator.matches(password, passwordReg)){
      return appError('400', '密碼需至少 8 碼以上，並英數混合', next);
    }
    
    // 加密密碼
    password = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      email,
      password,
      name
    });
    generateSendJWT(newUser, 200, res);
  }),

  // 登入
  signIn: handleErrorAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return appError('400', '帳號密碼不得為空', next);
    }

    const user = await User.findOne({ email }).select('+password');
    const auth = await bcrypt.compare(password, user.password);
    
    if (!auth || !user) {
      return appError('400', '帳號或密碼錯誤，請重新輸入', next);
    }

    generateSendJWT(user, 200, res);
  }),

  // 更新密碼
  updatePassword: handleErrorAsync(async (req, res, next) => {
    const { password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return appError('400', '密碼不一致', next);
    }
    newPassword = await bcrypt.hash(password, 12);
    const user = await User.findByIdAndUpdate(req.user.id, {
      password: newPassword
    });
    generateSendJWT(user, 200, res);
  }),

  // 取得個人資料
  getProfile: handleErrorAsync(async (req, res, next) => {
    const userId = req.user.id;
    const user = await User.findById(userId);
    handleSuccess(res, user);
  }),

  // 修改個人資料
  updateProfile: handleErrorAsync(async (req, res, next) => {
    const userId = req.user.id;
    // const paramsId = req.params.id;
    const { name, gender, photo } = req.body;
    
    if (!name || !gender) {
      return appError('400', '姓名與性別不得為空', next);
    }
    
    if (gender !== 'male' && gender !== 'female') {
      return appError('400', '性別參數錯誤', next);
    }
    
    const editData = await User.findByIdAndUpdate(
      req.user.id,
      { name, gender, photo },
      { new: true }
    )
    if (!editData) {
      return appError('400', '更新失敗', next);
    } else {
      handleSuccess(res, editData);
    }
  }),
  
  // 取得個人按讚列表
  getLikeList: handleErrorAsync(async (req, res, next) => {
    const likeList = await Post.find({
      likes: { $in: [req.user.id] }
    }).populate({
      path: 'user',
      select: 'name _id'
    });
    handleSuccess(res, likeList);
  }),

  // 追蹤朋友
  followUser: handleErrorAsync(async (req, res, next) => {
    if (req.params.id === req.user.id) {
      return appError('401', '您無法追蹤自己', next);
    }
    const isParamsId = await User.findById(req.params.id).exec();

    if (!isParamsId) {
      return appError('400', '使用者不存在', next);
    }

    await User.updateOne(
      {
        _id: req.user.id,
        'following.user': { $ne: req.params.id }
      },
      {
        $addToSet: { following: { user: req.params.id } }
      }
    );
    await User.updateOne(
      {
        _id: req.params.id,
        'followers.user': { $ne: req.user.id }
      },
      {
        $addToSet: { followers: { user: req.user.id } }
      }
    );
    handleSuccess(res, '您已成功追蹤');
  }),

  // 取消追蹤朋友
  unfollowUser: handleErrorAsync(async (req, res, next) => {
    if (req.params.id === req.user.id) {
      return appError('401', '您無法取消追蹤自己', next);
    }

    const isParamsId = await User.findById(req.params.id).exec();

    if (!isParamsId) {
      return appError('400', '使用者不存在', next);
    }

    await User.updateOne(
      {
        _id: req.user.id
      },
      {
        $pull: { following: { user: req.params.id } }
      }
    );
    await User.updateOne(
      {
        _id: req.params.id,
      },
      {
        $pull: { followers: { user: req.user.id } }
      }
    );
    handleSuccess(res, '您已成功取消追蹤');
  }),

  // 取得個人追蹤名單
  followingList: handleErrorAsync(async (req, res, next) => {
    const followList = await User.find({
      _id: req.user.id
    });
    handleSuccess(res, followList);
  })
}

module.exports = users;