// Central place for API 404 responses and server errors.
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isServerError = statusCode >= 500;

  console.error(isServerError ? 'Server error occurred.' : 'Request error.');

  res.status(statusCode).json({
    success: false,
    message: isServerError ? 'Something went wrong.' : (err.message || 'Request failed.'),
  });
};
