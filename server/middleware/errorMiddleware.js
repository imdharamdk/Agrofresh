const sendResponse = require('../utils/response');

const notFound = (req, res) => {
  sendResponse(res, 404, false, {}, `Route not found: ${req.originalUrl}`);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  const message = err.message || 'Something went wrong';

  sendResponse(res, statusCode, false, process.env.NODE_ENV === 'production' ? {} : { stack: err.stack }, message);
};

module.exports = {
  notFound,
  errorHandler
};
