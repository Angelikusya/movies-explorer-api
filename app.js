require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');

const { requestLogger, errorLogger } = require('./middlewares/logger');

const { router } = require('./routes');

const app = express();
const { PORT = 3001, MONGO_URL = 'mongodb://127.0.0.1:27017/bitfilmsdb' } = process.env;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(`${MONGO_URL}`)
  .then(() => console.log('база данных подключена'))
  .catch((err) => console.error(err));

const options = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
  ],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: ['Content-Type', 'origin', 'Authorization'],
  credentials: true,
};

app.use(cors(options));
app.use(express.json());
app.use(requestLogger); // подключаем логгер запросов

app.use(helmet());
app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадет');
  }, 0);
});
console.log('crash-test');

app.use(router);

app.use(errorLogger); // подключаем логгер ошибок

app.use(errors());
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
