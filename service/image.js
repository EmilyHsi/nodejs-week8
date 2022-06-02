const multer = require('multer');
const path = require('path');
const handleErrorAsync = require('../service/handleErrorAsync');
const appError = require('../service/appError');
const sizeOf = require('image-size');

const upload = multer({
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.jpg' && ext !== '.png' && ext !== '.jpeg') {
      cb(new Error('檔案格式錯誤，僅限上傳 jpg、jpeg 與 png 格式'));
    }
    cb(null, true);
  },
}).any();

const checkImg = handleErrorAsync(async(req, res, next) => {
  upload(req, res, async(error) => {
    const dimensions = sizeOf(req.files[0].buffer);

    if (error) {
      return appError('400', error.message);
    }
    
    if (!req.files?.length) {
      return appError('400', '請選擇圖片', next);
    }
    
    if (req.files[0].size > 2097152) {
      return appError('400', '圖片檔案過大，限 2MB 以下檔案', next);
    }
    
    if (dimensions.width < 300) {
      return appError('400', '解析度寬度至少 300 像素以上，請重新輸入', next);
    }

    if (dimensions.width !== dimensions.height) {
      return appError('400', '圖片長寬不符合 1:1 尺寸', next);
    }
    
    next();

  });
});

module.exports = checkImg;