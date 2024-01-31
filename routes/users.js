const { Router } = require('express');
const { getUser, updateUserInfo } = require('../controllers/users');
const { validateUserUpdate } = require('../middlewares/userValidation');

const userRouter = Router();

userRouter.get('/me', getUser);
userRouter.patch('/me', validateUserUpdate, updateUserInfo);

module.exports = { userRouter };
