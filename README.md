## My Movie DB – Back-End

This is a Node.js + TypeScript Express API that powers the full-stack Movie DB application. It serves as the connection layer between the front-end client and the PostgreSQL database.

The API handles all requests related to movies, users, and reviews, and includes dynamic SQL construction based on query parameters. It’s designed showcase exactly how API endpoints and database queries interact (and how it is used by a frontend).

A major focus of this project is transparency — SQL queries and their parameters are returned in the API response to show how frontend actions translate into real database operations.

## Tech Stack

• Node.js + Express
• TypeScript
• PostgreSQL (hosted on Supabase)
• Render (for deployment)
• JSON Web Tokens (JWT) for authentication
• Modular structure with clear separation of concerns:
o controllers handle business logic
o routes define the API
o db.ts for connection pooling
o middleware for token auth

## Key Features

• Fully RESTful API
• GET /api/movies: Retrieve all movies (with filters)
• GET /api/movies/:id: Get a single movie with reviews
• POST /api/movies: Add a new movie
• GET /api/reviews: Filter reviews dynamically
• GET /api/reviews/:id: Get a single review by ID
• POST /api/reviews/:movieId: Add a review (with authentication)
• Dynamic Filtering with SQL
• API endpoints construct SQL queries dynamically based on parameters
• Example filters:
• Movie: rating, genre, stars, inTheaters
• Review: reviewerType, stars, movieId
• Returned response includes:
• data – query results
• sql – the actual SQL statement
• params – values passed into the SQL query

## Authentication

• Uses Authorization: Bearer <token> headers
• Protected endpoints (e.g. posting reviews) require a valid JWT
• User info is pulled from the decoded token (authMiddleware.ts)

• Deployment
• Hosted on Render
• Uses environment variables:
• DATABASE_URL – Supabase PostgreSQL connection string
• JWT_SECRET – for signing auth tokens
• CORS_ORIGIN – e.g. https://kenwillcode.com

## In Code:

## Example Flow: Movie Filtering

Frontend user selects Movie filters:
• Rating = PG-13
• Genre = Horror
• Stars = 4
• In Theaters = true

The frontend sends:

GET /api/movies?rating=PG-13&genre=Horror&stars=4&inTheaters=true
The backend constructs and runs this SQL:

SELECT m.\*, ROUND(AVG(r.stars)) AS avg_stars
FROM "Movie" m
LEFT JOIN "Review" r ON m.id = r."movieId"
WHERE m.rating = $1 AND m.genre = $2 AND m."inTheaters" = $3
GROUP BY m.id
HAVING ROUND(AVG(r.stars)) = $4
ORDER BY "title" ASC
LIMIT $5 OFFSET $6

And responds with:

{
"data": [...],
"sql": "SELECT m.\*, ...",
"params": ["PG-13", "Horror", true, 4, 10, 0]
}

## Example Flow: Review Filtering

Frontend user selects Review filters:
• Stars = 5
• reviewerType = critic

Frontend sends:

GET /api/reviews?stars=5&reviewerType=critic
API dynamically builds the SQL query, applies the filters, and responds with:

{
"data": [...],
"sql": "SELECT r.\*, u.name FROM Review r JOIN User u ... WHERE ...",
"params": [5, "critic"]
}

## Why This Project?

This backend was designed not just to serve a client app — but to show the complete picture of how REST APIs work with SQL databases.
