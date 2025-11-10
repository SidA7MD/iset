const User = require('../models/User');
const tokenManager = require('../utils/tokenManager');
const { UnauthorizedError, ConflictError } = require('../utils/errorTypes');

class AuthService {
  async register(userData) {
    const { username, email, password, role } = userData;

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      throw new ConflictError('Username or email already exists');
    }

    const user = new User({ username, email, password, role });
    await user.save();

    return user;
  }

  async login(identifier, password) {
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    }).select('+password');

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    user.lastLogin = new Date();
    await user.save();

    const tokens = tokenManager.generateTokenPair(
      user._id.toString(),
      user.role,
      user.tokenVersion
    );

    return { user, tokens };
  }

  async refreshToken(refreshToken) {
    const decoded = tokenManager.verifyRefreshToken(refreshToken);

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or inactive');
    }

    if (decoded.tokenVersion !== user.tokenVersion) {
      throw new UnauthorizedError('Token has been revoked');
    }

    const accessToken = tokenManager.generateAccessToken({
      userId: user._id.toString(),
      role: user.role,
    });

    return { accessToken, user };
  }

  async logout(userId) {
    const user = await User.findById(userId);
    if (user) {
      await user.incrementTokenVersion();
    }
  }
}

module.exports = new AuthService();
