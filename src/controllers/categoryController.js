const categoryService = require('../services/categoryService');
const handleError = require('../utils/handleError');

const getAll = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.status(200).json(categories);
  } catch (error) {
    handleError(error, res);
  }
};

const getById = async (req, res) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    res.status(200).json(category);
  } catch (error) {
    handleError(error, res);
  }
};

const create = async (req, res) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json(category);
  } catch (error) {
    handleError(error, res);
  }
};

const update = async (req, res) => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    res.status(200).json(category);
  } catch (error) {
    handleError(error, res);
  }
};

const remove = async (req, res) => {
  try {
    const result = await categoryService.deleteCategory(req.params.id);
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
