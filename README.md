# Shushruta

## Project Description

Shushruta, is a comprehensive web application designed to streamline the organ transfer process. It addresses the critical need for speed and accuracy in organ procurement and transplantation by replacing manual, error-prone methods with an efficient digital platform. The system allows procurement and transplant centers to display available organs and their details in real-time, enabling hospitals to quickly request compatible organs and confirm transfers.

## Key Features

*   **Admin Panel**:
    *   Category Management (Add, Edit, View Categories)
    *   Product Management (Add, Edit, View Products)
    *   Order Management (View, Update Orders)
    *   Dashboard Analytics (Today's Sell, Customization)
    *   Hospital Profile Management
*   **User Dashboard**:
    *   User Profile Management
    *   Order Tracking
    *   Document Upload and Management
    *   Phone Verification
*   **Shop/E-commerce Functionality**:
    *   Product Listing by Category
    *   Single Product View with Details and Reviews
    *   Shopping Cart and Checkout Flow
    *   Wishlist Functionality
    *   User Authentication (Login, Signup, Forgot/Reset Password)
*   **Super Admin Panel**:
    *   Category Management
    *   Request Management
    *   Dashboard Analytics
*   **Real-time Communication**:
    *   Socket.io for real-time updates (e.g., order status)
*   **Location-based Services**:
    *   Map integration (Leaflet) for potential location-aware features.
*   **Payment Gateway Integration**:
    *   Braintree for secure transactions.
*   **SMS and Email Notifications**:
    *   Twilio for SMS and Nodemailer for email.

## Technologies Used

### Client-side (React.js)

*   **React**: A JavaScript library for building user interfaces.
*   **React Router DOM**: Declarative routing for React.js.
*   **Axios**: Promise-based HTTP client for the browser and Node.js.
*   **Bootstrap**: Front-end component library for responsive design.
*   **Leaflet & React-Leaflet**: Interactive maps.
*   **Moment.js**: Parse, validate, manipulate, and display dates and times.
*   **Socket.io-client**: Real-time bidirectional event-based communication.
*   **Braintree-web-drop-in-react**: Braintree payment UI integration for React.
*   **Twilio**: For SMS services.
*   **Nodemailer**: For email services.

### Server-side (Node.js with Express)

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

## Prerequisites

*   NPM and Node.js installed
*   MongoDB cluster created and added to the system's environment variable

## Installation

Execute these commands from the project directory:

```bash
cd client && npm install
cd server && npm install
```

## Running the App

Open a terminal in the `server` directory:

```bash
npm start:dev
```

And open another terminal in the `client` directory:

```bash
npm start
```

## Access the Web App

Access the web application on your system at `http://localhost:3000/`

## License

This project is licensed under the ISC License.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.
