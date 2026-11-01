const localityService = require('../services/localityService');
const handleError = require('../utils/handleError');

const getAll = async (req, res) => {
  try {
    const localities = await localityService.getAllLocalities(req.query);
    res.status(200).json(localities);
  } catch (error) {
    handleError(error, res);
  }
};

const getById = async (req, res) => {
  try {
    const locality = await localityService.getLocalityById(req.params.id);
    res.status(200).json(locality);
  } catch (error) {
    handleError(error, res);
  }
};

const create = async (req, res) => {
  try {
    const locality = await localityService.createLocality(req.body);
    res.status(201).json(locality);
  } catch (error) {
    handleError(error, res);
  }
};

const update = async (req, res) => {
  try {
    const locality = await localityService.updateLocality(req.params.id, req.body);
    res.status(200).json(locality);
  } catch (error) {
    handleError(error, res);
  }
};

const remove = async (req, res) => {
  try {
    const result = await localityService.deleteLocality(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    handleError(error, res);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
