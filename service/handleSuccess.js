function handleSuccess(res, data) {
  res.send({
    status: true,
    data
  }).end();
}
module.exports = handleSuccess;