// =====================================================

// backend/src/utils/tokenManager.js
const jwt = require('jsonwebtoken');
const config = require('../config/env');

class TokenManager {
  generateAccessToken(payload) {
    return jwt.sign(payload, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessExpiry,
    });
  }

  generateRefreshToken(payload) {
    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiry,
    });
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, config.jwt.accessSecret);
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, config.jwt.refreshSecret);
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  generateTokenPair(userId, role, tokenVersion = 0) {
    const accessPayload = { userId, role };
    const refreshPayload = { userId, tokenVersion };

    return {
      accessToken: this.generateAccessToken(accessPayload),
      refreshToken: this.generateRefreshToken(refreshPayload),
    };
  }
}

module.exports = new TokenManager();
