const { Router } = require('express');
const { userRouter } = require('./users');
// const { cardRouter } = require('./cards');
const NotFoundedError = require('../errors/NotFoundedError');
const { login, createUser } = require('../controllers/users');
const {
  validateUserAuthentication,
  validateUserInfo,
} = require('../middlewares/userValidation');

const auth = require('../middlewares/auth');

const router = Router();
router.post('/signup', validateUserInfo, createUser);
router.post('/signin', validateUserAuthentication, login);

router.use(auth);

router.use('/users', userRouter);
// router.use('/cards', cardRouter);

router.all('/*', (req, res, next) => {
  next(new NotFoundedError('Карточка с указанным ID не найдена'));
});

module.exports = { router };
