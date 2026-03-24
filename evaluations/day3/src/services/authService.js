const prisma = require('../db/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const crypto = require('crypto');

class AuthService {
  async register(data) {
    const { nom, email, password } = data;

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      throw { status: 409, message: 'Email ou mot de passe incorrect' };
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { nom, email, password: hashed }
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn }
    );

    return { user: { id: user.id, nom: user.nom, email: user.email, role: user.role }, token };
  }

  async login(data) {
    const { email, password } = data;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw { status: 401, message: 'Email ou mot de passe incorrect' };
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      throw { status: 401, message: 'Email ou mot de passe incorrect' };
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn }
    );

    const refreshTokenString = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

    await prisma.refreshToken.create({
      data: {
        token: refreshTokenString,
        userId: user.id,
        expiresAt
      }
    });

    return {
      user: { id: user.id, nom: user.nom, email: user.email, role: user.role },
      accessToken,
      refreshToken: refreshTokenString
    };
  }

  async refresh(refreshToken) {
   
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!stored) {
      throw { status: 401, message: 'Refresh token invalide' };
    }

    if (new Date() > stored.expiresAt) {
      throw { status: 401, message: 'Refresh token expiré' };
    }

    const user = stored.user;
    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn }
    );

    return { accessToken: newAccessToken };
  }

  async logout(refreshToken) {
    await prisma.refreshToken.delete({
      where: { token: refreshToken }
    }).catch(() => {}); 
  }

  async me(userId) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, nom: true, email: true, role: true, createdAt: true }
    });
  }
}

module.exports = new AuthService();
