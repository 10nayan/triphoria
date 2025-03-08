# Triphoria Project

Triphoria is a full-stack web application consisting of a frontend built with React and a backend built with Node.js and Express. The application connects to a MongoDB database.

## Project Structure

- **frontend/**: Contains the React frontend application.
- **backend/**: Contains the Node.js and Express backend application.

## Setup

### Frontend

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` directory with the following variable:
   ```
   REACT_APP_API_BASE_URL=http://localhost:5001
   ```
4. Start the development server:
   ```bash
   npm start
   ```

### Backend

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
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

## Technologies

- React
- Node.js
- Express
- MongoDB
- Mongoose

## License

This project is licensed under the MIT License.
