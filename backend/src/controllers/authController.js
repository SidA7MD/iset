const authService = require('../services/authService');

class AuthController {
  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      // Accept username OR email
      const identifier = req.body.identifier || req.body.username;
      const { password } = req.body;

      if (!identifier || !password) {
        return res.status(400).json({ success: false, error: 'Missing credentials' });
      }

      const { user, tokens } = await authService.login(identifier, password);

      // Set httpOnly refresh token
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user,
          accessToken: tokens.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ success: false, error: 'Refresh token not found' });
      }

      const { accessToken, user } = await authService.refreshToken(refreshToken);

      res.json({
        success: true,
        data: { accessToken, user },
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      await authService.logout(req.user.userId);
      res.clearCookie('refreshToken');

      res.json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const User = require('../models/User');
      const user = await User.findById(req.user.userId);

      res.json({ success: true, data: { user } });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
