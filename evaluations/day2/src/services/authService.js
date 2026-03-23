const prisma = require('../db/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

class AuthService {
  async register(data) {
    const { nom, email, password } = data;

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      throw { status: 409, message: 'Email incorrect' };
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

    return { user, token };
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

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn }
    );

    return { user, token };
  }

  async me(userId) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, nom: true, email: true, role: true, createdAt: true }
    });
  }
}

module.exports = new AuthService();