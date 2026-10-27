const zoneService = require('../services/zoneService');
const handleError = require('../utils/handleError');

const getAll = async (req, res) => {
  try {
    const zones = await zoneService.getAllZones();
    res.status(200).json(zones);
  } catch (error) {
    handleError(error, res);
  }
};

const getById = async (req, res) => {
  try {
    const zone = await zoneService.getZoneById(req.params.id);
    res.status(200).json(zone);
  } catch (error) {
    handleError(error, res);
  }
};

const create = async (req, res) => {
  try {
    const zone = await zoneService.createZone(req.body);
    res.status(201).json(zone);
  } catch (error) {
    handleError(error, res);
  }
};

const update = async (req, res) => {
  try {
    const zone = await zoneService.updateZone(req.params.id, req.body);
    res.status(200).json(zone);
  } catch (error) {
    handleError(error, res);
  }
};

const remove = async (req, res) => {
  try {
    const result = await zoneService.deleteZone(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    handleError(error, res);
  }
};

const getHojaDeRuta = async (req, res) => {
  try {
    const data = await zoneService.getHojaDeRuta(req.params.id);
    res.status(200).json(data);
  } catch (error) {
    handleError(error, res);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getHojaDeRuta
};
