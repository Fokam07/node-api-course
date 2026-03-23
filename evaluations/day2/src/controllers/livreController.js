const livreService = require('../services/livreService');

exports.getAll = async (req, res, next) => {
  try {
    const livres = await livreService.findAll();
    res.json(livres);
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const livre = await livreService.findById(req.params.id);
    res.json(livre);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const livre = await livreService.create(req.body);
    res.status(201).json(livre);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const livre = await livreService.update(req.params.id, req.body);
    res.json(livre);
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await livreService.delete(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.emprunter = async (req, res, next) => {
  try {
    const data = await livreService.emprunter(req.params.id, req.user.userId);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.retourner = async (req, res, next) => {
  try {
    const data = await livreService.retourner(req.params.id, req.user.userId);
    res.json(data);
  } catch (err) {
    next(err);
  }
};