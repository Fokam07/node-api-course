const env = require('../config/env');

function errorHandler(err, req, res, next) {
  console.error('[ERROR]', {
    message: err.message,
    status: err.status || 500,
   
    path: req.path,
    method: req.method,
  });

  const statusCode = err.status || 500;
  
  
  if (env.isProduction && statusCode >= 500) {
    return res.status(statusCode).json({ 
      error: 'Erreur interne du serveur' 
    });
  }

  res.status(statusCode).json({
    error: err.message || 'Erreur inconnue',
    ...(env.isDevelopment && { stack: err.stack })
  });
}

module.exports = errorHandler;
