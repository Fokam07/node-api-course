const authService = require('../services/authService');

exports.register = async (req, res, next) => {
  try {
    const data = await authService.register(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const data = await authService.login(req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await authService.me(req.user.userId);
    res.json(user);
  } catch (err) {
    next(err);
  }
};