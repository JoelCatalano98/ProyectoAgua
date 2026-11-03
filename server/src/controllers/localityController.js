const localityService = require('../services/localityService');

const getAll = async (req, res, next) => {
  try {
    const localities = await localityService.getAllLocalities(req.query);
    res.status(200).json(localities);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const locality = await localityService.getLocalityById(req.params.id);
    res.status(200).json(locality);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const locality = await localityService.createLocality(req.body);
    res.status(201).json(locality);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const locality = await localityService.updateLocality(req.params.id, req.body);
    res.status(200).json(locality);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await localityService.deleteLocality(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
