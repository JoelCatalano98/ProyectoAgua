const productService = require('../services/productService');
const handleError = require('../utils/handleError');

const getAll = async (req, res) => {
  try {
    const products = await productService.getAllProducts(req.query);
    res.status(200).json(products);
  } catch (error) {
    handleError(error, res);
  }
};

const getById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.status(200).json(product);
  } catch (error) {
    handleError(error, res);
  }
};

const create = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    handleError(error, res);
  }
};

const update = async (req, res) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.status(200).json(product);
  } catch (error) {
    handleError(error, res);
  }
};

const remove = async (req, res) => {
  try {
    const result = await productService.deleteProduct(req.params.id);
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
