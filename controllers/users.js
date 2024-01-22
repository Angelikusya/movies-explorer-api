const { ValidationError } = require('mongoose').Error;
const bcrypt = require('bcrypt');
const userModel = require('../models/user');
const generateToken = require('../utils/jwt');
const BadRequestError = require('../errors/BadRequestError');
const ConflictError = require('../errors/ConflictError');
const NotFoundedError = require('../errors/NotFoundedError');
const UnauthorizedError = require('../errors/UnauthorizedError');

const STATUS_OK = 200;
const STATUS_CREATED = 201;

// получить пользователя
const getUser = (req, res, next) => {
  userModel.findById(req.user._id)
    .then((user) => {
      if (!user) {
        return next(new NotFoundedError('Пользователь по указанному _id не найден'));
      }
      return res.status(STATUS_OK).send(user);
    })
    .catch(() => next());
};

// обновить информацию о пользователе
const updateUserInfo = (req, res, next) => {
  const { name, email } = req.body;
  console.log(req.user);
  userModel.findByIdAndUpdate(req.user._id, { name, email }, { runValidators: true, new: true })
    .then((user) => {
      res
        .status(STATUS_OK)
        .send(user);
    })
    .catch((error) => {
      if (error instanceof ValidationError) {
        return next(new BadRequestError('Переданы некорректные данные при работе с пользователем'));
      }
      return next(error);
    });
};

// создать нового пользователя
const createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;

  return bcrypt.hash(password, 10)
    .then((hash) => userModel.create({
      name, email, password: hash,
    }))
    .then((user) => res
      .status(STATUS_CREATED)
      .send({
        name: user.name,
        email: user.email,
      }))
    .catch((error) => {
      if (error instanceof ValidationError) {
        return next(new BadRequestError('Переданы некорректные данные при работе с пользователем'));
      } if (error.code === 11000) {
        return next(new ConflictError('Пользователь с такими данными уже существует'));
      }
      return next(error);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  userModel.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return next(new UnauthorizedError('Необходима авторизация'));
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            // хеши не совпали — отклоняем
            return next(new UnauthorizedError('Необходима авторизация'));
          }
          const token = generateToken({ _id: user._id });
          // res.cookie('token', token, { httpOnly: true });
          return res
            .status(STATUS_OK)
            .send({ token });
        });
    })
    .catch(() => next());
};

module.exports = {
  getUser,
  createUser,
  updateUserInfo,
  login,
};
