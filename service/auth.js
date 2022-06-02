const jwt = require('jsonwebtoken');
const appError = require('../service/appError');
const handleErrorAsync = require('../service/handleErrorAsync');
const express = require('express');
const User = require('../model/user');

const isAuth = handleErrorAsync(async(req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(appError(401, '尚未登入', next));
  }

  // 驗證 token 正確性
  const decoded = await new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (error, payload) => {
      if (error) {
        return appError('401', error.message, next);
      } else {
        resolve(payload);
      }
    });
  });
  const currentUser = await User.findById(decoded.id);
  req.user = currentUser;
  next();
});

const generateSendJWT = (user, statusCode, res) => {
  const token = jwt.sign(
    { 
      id: user._id, 
      name: user.name,
      photo: user.photo
    },
    process.env.JWT_SECRET,
    {
     expiresIn: process.env.JWT_EXPIRES_DAY
    }
  );
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    user: {
      token,
      name: user.name,
      photo: user.photo
    }
  });
}

module.exports = {
  isAuth,
  generateSendJWT
}