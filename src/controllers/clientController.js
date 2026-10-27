const clientService = require('../services/clientService');
const handleError = require('../utils/handleError');

const getAll = async (req, res) => {
  try {
    const clients = await clientService.getAllClients(req.query);
    res.status(200).json(clients);
  } catch (error) {
    handleError(error, res);
  }
};

const getById = async (req, res) => {
  try {
    const client = await clientService.getClientById(req.params.id);
    res.status(200).json(client);
  } catch (error) {
    handleError(error, res);
  }
};

const create = async (req, res) => {
  try {
    const client = await clientService.createClient(req.body);
    res.status(201).json(client);
  } catch (error) {
    handleError(error, res);
  }
};

const update = async (req, res) => {
  try {
    const client = await clientService.updateClient(req.params.id, req.body);
    res.status(200).json(client);
  } catch (error) {
    handleError(error, res);
  }
};

const remove = async (req, res) => {
  try {
    const result = await clientService.deleteClient(req.params.id);
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
