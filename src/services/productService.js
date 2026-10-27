const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const AppError = require('../utils/AppError');

const getAllProducts = async (filter = {}) => {
  const query = {};
  if (filter.categoria) {
    query.categoria = filter.categoria;
  }
  return Product.find(query).populate('categoria').sort({ nombre: 1 });
};

const getProductById = async (id) => {
  const product = await Product.findById(id).populate('categoria');
  if (!product) {
    throw new AppError('Producto no encontrado', 404);
  }
  return product;
};

const createProduct = async (data) => {
  if (!data.categoria) {
    throw new AppError('La categoría es requerida', 400);
  }

  const categoryExists = await Category.findById(data.categoria);
  if (!categoryExists) {
    throw new AppError('La categoría especificada no existe', 400);
  }

  const product = await Product.create(data);
  return Product.findById(product._id).populate('categoria');
};

const updateProduct = async (id, data) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new AppError('Producto no encontrado', 404);
  }

  if (data.categoria) {
    const categoryExists = await Category.findById(data.categoria);
    if (!categoryExists) {
      throw new AppError('La categoría especificada no existe', 400);
    }
  }

  Object.assign(product, data);
  await product.save();
  return Product.findById(id).populate('categoria');
};

const deleteProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new AppError('Producto no encontrado', 404);
  }

  await Product.findByIdAndDelete(id);
  return { message: 'Producto eliminado correctamente', id };
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
