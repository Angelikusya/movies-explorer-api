const { ValidationError, CastError } = require('mongoose').Error;
const movieModel = require('../models/movie');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundedError = require('../errors/NotFoundedError');
const ForbiddenError = require('../errors/UnauthorizedError');

const STATUS_OK = 200;
const STATUS_CREATED = 201;

// возвращает все сохранённые текущим пользователем фильмы
const getMovies = (req, res, next) => {
  movieModel.find({ owner: req.user._id })
    .then((movies) => res
      .status(STATUS_OK)
      .send(movies))
    .catch(() => next());
};

// создать новую карточку c фильмом
const createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;
  movieModel.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner: req.user._id,
  })
    .then(() => res
      .status(STATUS_CREATED)
      .send({ message: 'Фильм успешно создан' }))
    .catch((error) => {
      if (error instanceof ValidationError) {
        next(new BadRequestError('Переданы некорректные данные при работе с карточкой'));
      } else {
        next(error);
      }
    });
};

// удалить карточку
const deleteMovie = (req, res, next) => {
  movieModel.findById(req.params._id)

    .then((movie) => {
      if (!movie) {
        return next(new NotFoundedError('Фильм с указанным ID не найден'));
      }
      if (movie.owner.toString() !== req.user._id) {
        return next(new ForbiddenError('Вы не можете удалить карточку другого пользователя'));
      }
      return movie.deleteOne(movie._id)
        .then(() => res
          .status(STATUS_OK)
          .send({ message: 'Фильм успешно удален' }))
        .catch((err) => next(err));
    })
    .catch((error) => {
      if (error instanceof CastError) {
        next(new BadRequestError('Переданы некорректные данные при работе с карточкой'));
      }
      return next(error);
    });
};

module.exports = {
  getMovies,
  createMovie,
  deleteMovie,
};
