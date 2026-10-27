const userService = require('../services/userService');
const handleError = require('../utils/handleError');

const register = async (req, res) => {
  try {
    const user = await userService.registerUser(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Usuario registrado exitosamente',
      user
    });
  } catch (error) {
    handleError(error, res);
  }
};

const login = async (req, res) => {
  try {
    const result = await userService.loginUser(req.body);
    res.status(200).json(result);
  } catch (error) {
    handleError(error, res);
  }
};

module.exports = {
  register,
  login
};
