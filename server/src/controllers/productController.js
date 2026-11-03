const productService = require('../services/productService');

const getAll = async (req, res, next) => {
  try {
    const products = await productService.getAllProducts(req.query);
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await productService.deleteProduct(req.params.id);
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
