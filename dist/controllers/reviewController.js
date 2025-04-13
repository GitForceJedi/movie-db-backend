import { pool } from '../db.js';
function validateReviewInput(input) {
    return (typeof input.stars === 'number' &&
        input.stars >= 1 &&
        input.stars <= 5 &&
        typeof input.rating === 'number' &&
        input.rating >= 1 &&
        input.rating <= 5 &&
        typeof input.comment === 'string');
}
export const createReview = async (req, res) => {
    if (!validateReviewInput(req.body)) {
        return res.status(400).json({ error: 'Invalid review input' });
    }
    try {
        const movieId = parseInt(req.params.movieId);
        const { rating, comment, stars } = req.body;
        const result = await pool.query('INSERT INTO "Review" ("movieId", "userId", rating, comment, stars) VALUES ($1, $2, $3, $4, $5) RETURNING *', [movieId, req.user.id, rating, comment, stars]);
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        res.status(500).json({ error: 'Review creation failed', details: err });
    }
};
export const getReviewById = async (req, res) => {
    try {
        console.log('[getReviewById] endpoint hit with ID:', req.params.id);
        const id = parseInt(req.params.id);
        const result = await pool.query(`SELECT r.*, u.name, u.email, m.title AS movie_title, m.rating AS movie_rating, m.genre
       FROM "Review" r
       JOIN "User" u ON r."userId" = u.id
       JOIN "Movie" m ON r."movieId" = m.id
       WHERE r.id = $1`, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Review not found' });
        }
        const review = result.rows[0];
        res.json({
            data: review,
            sql: `SELECT ... WHERE r.id = ${id}`,
            params: [id],
        });
    }
    catch (err) {
        res
            .status(500)
            .json({ error: 'Failed to fetch review by ID', details: err });
    }
};
export const getFilteredReviews = async (req, res) => {
    console.log('[getFilteredReviews] endpoint hit with ID:', req.params.id);
    const { rating, reviewerType, stars, movieId, page = '1', limit = '10', sort = 'createdAt', order = 'desc', } = req.query;
    try {
        let query = `
      SELECT r.*, u.name, u.email, m.title AS movie_title, m.rating AS movie_rating, m.genre
      FROM "Review" r
      JOIN "User" u ON r."userId" = u.id
      JOIN "Movie" m ON r."movieId" = m.id
    `;
        const params = [];
        const conditions = [];
        if (rating) {
            params.push(rating);
            conditions.push(`m.rating = $${params.length}`);
        }
        if (reviewerType) {
            params.push(reviewerType);
            conditions.push(`u."reviewerType" = $${params.length}`);
        }
        if (stars) {
            params.push(parseInt(stars));
            conditions.push(`r.stars = $${params.length}`);
        }
        if (movieId) {
            params.push(parseInt(movieId));
            conditions.push(`m.id = $${params.length}`);
        }
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        const validSortFields = ['stars', 'createdAt', 'rating'];
        const sortField = validSortFields.includes(sort)
            ? sort
            : 'createdAt';
        const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
        query += ` ORDER BY r."${sortField}" ${sortOrder}`;
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const offset = (pageNumber - 1) * limitNumber;
        query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limitNumber);
        params.push(offset);
        console.log('Executing SQL:', query);
        console.log('With parameters:', params);
        const result = await pool.query(query, params);
        res.json({
            data: result.rows,
            sql: query,
            params,
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Error filtering reviews', details: err });
    }
};
