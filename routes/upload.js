const express = require('express');
const router = express.Router();
const upload = require('../service/image');
const { isAuth } = require('../service/auth');
const uploadImgControllers = require('../controllers/uploadImg');

router.post('/', isAuth, upload, uploadImgControllers.uploadImg);

module.exports = router;