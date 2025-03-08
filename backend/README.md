# Backend

This is the backend of the Triphoria project. It is built using Node.js and Express, and it connects to a MongoDB database.

## Setup

1. Ensure MongoDB is running on your local machine.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory with the following variables:
   ```
   MONGO_URI=mongodb://localhost:27017/triphoria
   JWT_SECRET=your_jwt_secret
   PORT=5001
   ```
4. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

- **POST /api/auth/register**: Register a new user.
- **POST /api/auth/login**: Login a user.

## Technologies

- Node.js
- Express
- MongoDB
- Mongoose
