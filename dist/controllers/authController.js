import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
function validateRegisterInput(input) {
    return (typeof input.email === 'string' &&
        typeof input.password === 'string' &&
        (input.reviewerType === 'audience' || input.reviewerType === 'critic') &&
        input.password.length >= 6 &&
        typeof input.name === 'string');
}
function validateLoginInput(input) {
    return typeof input.email === 'string' && typeof input.password === 'string';
}
export const register = async (req, res) => {
    if (!validateRegisterInput(req.body)) {
        return res.status(400).json({ error: 'Invalid registration input' });
    }
    const { email, password, name, reviewerType } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const sqlQuery = `
      INSERT INTO "User" (email, password, name, "reviewerType")
      VALUES ($1, $2, $3, $4)
      RETURNING id, email
    `;
        const params = [email, hashedPassword, name, reviewerType];
        const result = await pool.query(sqlQuery, params);
        res.status(201).json({
            message: 'User registered',
            user: result.rows[0],
            sql: {
                query: sqlQuery.trim(),
                params,
            },
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Registration failed', details: err });
    }
};
export const login = async (req, res) => {
    if (!validateLoginInput(req.body)) {
        return res.status(400).json({ error: 'Invalid login input' });
    }
    const { email, password } = req.body;
    try {
        const sqlQuery = `SELECT * FROM "User" WHERE email = $1`;
        const params = [email];
        const result = await pool.query(sqlQuery, params);
        const user = result.rows[0];
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        const match = await bcrypt.compare(password, user.password);
        if (!match)
            return res.status(403).json({ message: 'Invalid credentials' });
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({
            message: 'Login successful',
            token,
            sql: {
                query: sqlQuery,
                params,
            },
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Login failed', details: err });
    }
};
