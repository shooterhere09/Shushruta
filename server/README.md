# Server-side Application (Shushruta API)

This directory contains the server-side application (API) for Shushruta, built using Node.js and Express.js. It handles all the backend logic, including database interactions, API endpoints for client-side requests, authentication, payment processing, and real-time communication.

## Technologies Used

*   **Node.js**: JavaScript runtime environment.
*   **Express.js**: Web application framework for Node.js.
*   **MongoDB (via Mongoose)**: NoSQL database and ODM for Node.js.
*   **Bcryptjs**: For password hashing.
*   **Braintree**: Payment gateway integration.
*   **Cloudinary**: Cloud-based image and video management.
*   **CORS**: Middleware for enabling Cross-Origin Resource Sharing.
*   **Crypto-js**: JavaScript library of crypto standards.
*   **Dotenv**: Loads environment variables from a `.env` file.
*   **Express-fileupload**: Middleware for uploading files.
*   **Fuse.js**: Lightweight fuzzy-search library.
*   **Geolib**: Library to work with geographic coordinates.
*   **JSON Web Token (jsonwebtoken)**: For authentication.
*   **Leaflet & React-Leaflet**: Interactive maps.
*   **Libphonenumber-js**: Phone number parsing and formatting.
*   **Morgan**: HTTP request logger middleware.
*   **Multer**: Middleware for handling `multipart/form-data`.
*   **Natural**: Natural language processing for Node.js.
*   **Nodemailer**: For sending emails.
*   **Nodemon**: Utility that monitors for changes in your source and automatically restarts your server.
*   **Socket.io**: Real-time bidirectional event-based communication.
*   **Twilio**: For SMS services.

## Project Structure

The `server` directory is organized into the following main sections:

*   `app.js`: The main application file, setting up Express and middleware.
*   `server.js`: Entry point for the server, typically starts the Express app.
*   `controllers`: Contains the logic for handling requests and interacting with models.
*   `models`: Defines the Mongoose schemas for the MongoDB database.
*   `routes`: Defines the API endpoints and links them to the appropriate controllers.
*   `middleware`: Custom middleware functions (e.g., for authentication, error handling).
*   `config`: Configuration files (e.g., database connection, environment variables).
*   `utils`: Utility functions used across the server.

## Available Scripts

In the `server` directory, you can run:

### `npm start:dev`

Runs the server in development mode using `nodemon`, which automatically restarts the server upon file changes.