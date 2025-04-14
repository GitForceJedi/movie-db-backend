import { Request, Response } from 'express';
import { pool } from '../db.js';

interface MovieInput {
  title: string;
  description: string;
  releaseDate: string;
  inTheaters: boolean;
  rating: string;
  genre: string;
}

function validateMovieInput(input: any): input is MovieInput {
  return (
    typeof input.title === 'string' &&
    typeof input.description === 'string' &&
    typeof input.releaseDate === 'string' &&
    typeof input.inTheaters === 'boolean' &&
    typeof input.rating === 'string' &&
    typeof input.genre === 'string'
  );
}

export const getAllMovies = async (req: Request, res: Response) => {
  try {
    const {
      rating,
      stars,
      genre,
      inTheaters,
      page = '1',
      limit = '10',
      sort = 'title',
      order = 'asc',
    } = req.query;

    let query = `
      SELECT m.*, ROUND(AVG(r.stars)) AS avg_stars
      FROM "Movie" m
      LEFT JOIN "Review" r ON m.id = r."movieId"
      `;

    const params: any[] = [];
    const conditions: string[] = [];

    if (rating) {
      params.push(rating);
      conditions.push(`m.rating = $${params.length}`);
    }

    if (genre) {
      params.push(genre);
      conditions.push(`m.genre = $${params.length}`);
    }

    if (inTheaters) {
      params.push(inTheaters === 'true');
      conditions.push(`m."inTheaters" = $${params.length}`);
    }

    query += conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    query += ` GROUP BY m.id 
     `;

    if (stars) {
      params.push(parseInt(stars as string));
      query += ` HAVING ROUND(AVG(r.stars)) = $${params.length}`;
    }

    const validSortFields = ['title', 'releaseDate', 'rating', 'avg_stars'];
    const sortField = validSortFields.includes(sort as string) ? sort : 'title';
    const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

    query += ` ORDER BY "${sortField}" ${sortOrder}
    `;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit);
    params.push(offset);

    console.log('Executing SQL:', query);
    console.log('With parameters:', params);

    const result = await pool.query(query, params);
    res.json({
      data: result.rows,
      sql: query,
      params,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve movies', details: err });
  }
};

export const getMovieById = async (req: Request, res: Response) => {
  try {
    const movieId = parseInt(req.params.id);

    const sqlMovieQuery = 'SELECT * FROM "Movie" WHERE id = $1';
    const movieParams = [movieId];
    const movieResult = await pool.query(sqlMovieQuery, movieParams);

    const sqlReviewQuery = 'SELECT * FROM "Review" WHERE "movieId" = $1';
    const reviewParams = [movieId];
    const reviewResult = await pool.query(sqlReviewQuery, reviewParams);

    if (movieResult.rows.length === 0) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const movie = movieResult.rows[0];
    movie.reviews = reviewResult.rows;

    res.json({
      data: movie,
      sql: {
        movieQuery: sqlMovieQuery,
        movieParams,
        reviewQuery: sqlReviewQuery,
        reviewParams,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve movie', details: err });
  }
};

export const createMovie = async (req: Request, res: Response) => {
  if (!validateMovieInput(req.body)) {
    return res.status(400).json({ error: 'Invalid movie input' });
  }

  try {
    const { title, description, releaseDate, inTheaters, rating, genre } =
      req.body;

    const sqlInsertQuery = `
      INSERT INTO "Movie" (title, description, "releaseDate", "inTheaters", rating, genre)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const insertParams = [
      title,
      description,
      releaseDate,
      inTheaters,
      rating,
      genre,
    ];
    const result = await pool.query(sqlInsertQuery, insertParams);

    res.status(201).json({
      data: result.rows[0],
      sql: {
        query: sqlInsertQuery.trim(),
        params: insertParams,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Movie creation failed', details: err });
  }
};
