const zoneService = require('../services/zoneService');

const getAll = async (req, res, next) => {
  try {
    const zones = await zoneService.getAllZones(req.query);
    res.status(200).json(zones);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const zone = await zoneService.getZoneById(req.params.id);
    res.status(200).json(zone);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const zone = await zoneService.createZone(req.body);
    res.status(201).json(zone);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const zone = await zoneService.updateZone(req.params.id, req.body);
    res.status(200).json(zone);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await zoneService.deleteZone(req.params.id);
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
