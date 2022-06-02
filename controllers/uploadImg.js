const { ImgurClient } = require('imgur');
const handleSuccess = require('../service/handleSuccess');
const appError = require('../service/appError');
const handleErrorAsync = require('../service/handleErrorAsync');

const upload = {
  uploadImg: handleErrorAsync(async (req, res, next) => {
    const client = new ImgurClient({
      clientId: process.env.IMGUR_CLIENTID,
      clientSecret: process.env.IMGUR_CLIENT_SECRET,
      refreshToken: process.env.IMGUR_REFRESH_TOKEN
    });

    const response = await client.upload({
      image: req.files[0].buffer.toString('base64'),
      type: 'base64',
      album: process.env.IMGUR_ALBUM_ID
    });

    if (!response) {
      return appError('400', '圖片上傳失敗，請重新上傳', next);
    }

    handleSuccess(res, { imgUrl: response.data.link });
    
  }),
}

module.exports = upload;