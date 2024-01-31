const { Router } = require('express');
const {
  getMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movies');

const {
  validateMovie,
  validateMovieId,
} = require('../middlewares/movieValidation');

const movieRouter = Router();

movieRouter.get('/', getMovies); // возвращает все карточки c фильмами
movieRouter.post('/', validateMovie, createMovie); // создаёт карточку с фильмом
movieRouter.delete('/:_id', validateMovieId, deleteMovie); // удаляет карточку по идентификатору

module.exports = { movieRouter };
