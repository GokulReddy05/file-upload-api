# File Upload API

A backend REST API built with Node.js, Express, PostgreSQL, and Supabase Storage for secure PDF uploads and document management.

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Supabase Storage
- JWT authentication
- bcryptjs for password hashing
- Multer for file uploads

## Features

- User registration and login
- Password hashing with bcrypt
- JWT-based authentication
- Protected document endpoints
- PDF upload with a 10 MB size limit
- Document metadata stored in PostgreSQL
- PDF files stored in a private Supabase Storage bucket
- Retrieve document metadata by ID
- Download documents
- Delete documents
- Document ownership verification

## Prerequisites

- Node.js and npm
- A Supabase project
- A PostgreSQL connection string
- Postman for API testing

## Setup

1. Clone the repository:

   ```bash
   git clone YOUR_GITHUB_REPOSITORY_URL
   cd file-upload-api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root.

4. Configure the following environment variables:

   ```env
   PORT=3000
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET_TOKEN=your_jwt_secret
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SECRET_KEY=your_supabase_secret_key
   ```

   Replace the placeholder values with your own credentials. Never commit your `.env` file or expose your secrets.

5. Create a private Supabase Storage bucket named `documents`.

6. Create the `users` and `documents` tables according to your application's database schema.

7. Start the server using the start script configured in `package.json`.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a user |
| POST | `/auth/login` | Log in and receive a JWT |
| POST | `/documents/upload` | Upload a PDF |
| GET | `/documents/:id` | Retrieve document metadata |
| GET | `/documents/:id/download` | Download a PDF |
| DELETE | `/documents/:id` | Delete a document |

Protected document endpoints require a valid JWT in the Authorization header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

For PDF uploads, use `multipart/form-data` with a file field named `file`.

## File Storage

PDF files are stored in the private Supabase Storage bucket. PostgreSQL stores document metadata, ownership information, and the storage key.

## Security

- Passwords are hashed before storage.
- Protected endpoints require JWT authentication.
- Document queries check ownership.
- SQL queries use parameterized values.
- Environment variables hold sensitive configuration.

## Testing

Use Postman to test registration, login, document uploads, metadata retrieval, downloads, and deletion.

## Future Improvements

- Automated tests
- Improved PDF content validation
- More robust storage/database failure recovery
- API documentation
- Production logging and deployment
