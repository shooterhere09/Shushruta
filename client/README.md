# Client-side Application (Shushruta)

This directory contains the client-side application for Shushruta, built using React.js. It provides the user interface for all interactions with the Shushruta platform, including user authentication, product browsing, order management, and administrative functionalities.

## Technologies Used

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

## Project Structure

The `src` directory is organized into the following main sections:

*   `components/admin`: Contains components related to the administrator panel, including categories, dashboard, hospital details, orders, partials, and products.
*   `components/shop`: Contains components for the main e-commerce functionalities, such as authentication, user dashboard, home page, layout, order process, partials, product details, and wishlist.
*   `components/superadmin`: Contains components for super administrator functionalities, including categories, requests, and dashboard.
*   `hooks`: Custom React hooks used across the application.
*   `App.js`: The main application component.
*   `index.js`: The entry point of the React application.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.
