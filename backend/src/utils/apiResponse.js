function sendSuccess(res, { statusCode = 200, message = "Success", data = null, meta } = {}) {
  const response = { success: true, message, data };
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
}

module.exports = { sendSuccess };
