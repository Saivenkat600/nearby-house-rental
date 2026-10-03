function notFound(req, res) {
  return res.status(404).json({
    success: false,
    message: `No API route found for ${req.method} ${req.originalUrl}.`
  });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  let statusCode = error.statusCode || 500;
  let message = error.message || "Something went wrong.";
  let errors;

  if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Please check the provided information.";
    errors = Object.values(error.errors).map((item) => ({
      field: item.path,
      message: item.message
    }));
  } else if (error.name === "CastError") {
    statusCode = 400;
    message = "The supplied identifier or value is invalid.";
  } else if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    statusCode = 400;
    message = "The request body must contain valid JSON.";
  } else if (error.code === 11000) {
    statusCode = 409;
    message = "A record with that value already exists.";
  }

  if (statusCode >= 500) {
    console.error(error);
    message = process.env.NODE_ENV === "production" ? "An unexpected server error occurred." : message;
  }
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
}

module.exports = { notFound, errorHandler };
