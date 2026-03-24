// src/utils/jwt.js
const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Générer un token JWT
 */
function generateToken(payload) {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

/**
 * Vérifier un token JWT
 * @throws {JsonWebTokenError} si invalide
 * @throws {TokenExpiredError} si expiré
 */
function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

module.exports = { generateToken, verifyToken };
