const clientService = require('../services/clientService');

const getAll = async (req, res, next) => {
  try {
    const clients = await clientService.getAllClients(req.query);
    res.status(200).json(clients);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const client = await clientService.getClientById(req.params.id);
    res.status(200).json(client);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const client = await clientService.createClient(req.body);
    res.status(201).json(client);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const client = await clientService.updateClient(req.params.id, req.body);
    res.status(200).json(client);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await clientService.deleteClient(req.params.id);
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
