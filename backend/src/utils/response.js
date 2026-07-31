// API Yanıtlarını standartlaştırmak için yardımcı fonksiyonlar

const sendSuccess = (res, data = {}, message = 'İşlem başarılı', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message
  });
};

const sendError = (res, message = 'Hata oluştu', code = 'BAD_REQUEST', statusCode = 400, fields = {}) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      fields
    }
  });
};

module.exports = {
  sendSuccess,
  sendError
};
