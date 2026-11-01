const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const AppError = require('../utils/AppError');

const getAllCategories = async () => {
  return Category.find().sort({ nombre: 1 });
};

const getCategoryById = async (id) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new AppError('Categoría no encontrada', 404);
  }
  return category;
};

const createCategory = async (data) => {
  if (!data.nombre || !data.nombre.trim()) {
    throw new AppError('El nombre de la categoría es requerido', 400);
  }
  const existing = await Category.findOne({ nombre: data.nombre.trim() });
  if (existing) {
    throw new AppError('Ya existe una categoría con ese nombre', 400);
  }
  return Category.create(data);
};

const updateCategory = async (id, data) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new AppError('Categoría no encontrada', 404);
  }
  if (data.nombre && data.nombre.trim() !== category.nombre) {
    const existing = await Category.findOne({ nombre: data.nombre.trim() });
    if (existing && existing._id.toString() !== id) {
      throw new AppError('Ya existe una categoría con ese nombre', 400);
    }
  }
  Object.assign(category, data);
  return category.save();
};

const deleteCategory = async (id) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new AppError('Categoría no encontrada', 404);
  }

  // Regla de negocio: No permitir borrar una Category con productos
  const productCount = await Product.countDocuments({ categoria: id });
  if (productCount > 0) {
    throw new AppError(
      `No se puede eliminar la categoría porque tiene ${productCount} producto(s) asociado(s)`,
      400
    );
  }

  await Category.findByIdAndDelete(id);
  return { message: 'Categoría eliminada correctamente', id };
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
