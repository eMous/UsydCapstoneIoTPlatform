
# Getting Started with the IoT Platform

The IoT platform consists of 3 main applications, namely:
- Web application
- Server-side application
- Mobile application

## Running the project
### Web application

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

Navigate to the root folder of the project and install the project dependencies using:
`npm install`
In the project directory, you can run:
Command | Description
--------|------------
npm start | Runs the server on http://localhost:3000 in DEVELOPMENT mode
npm test | Launches the Jest test runner in the interactive watch mode (See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.)
npm build | Builds the application for production in the `build` folder. It will correctly bundle React in production mode and optimizes the build for the best performance.
npm eject | WARNING: Once the project has been ejected, it **CANNOT BE UNDONE**. This allows us to remove the single-build dependency from the project and copies all configuration files and dependencies into the project so that we have full control over them.

Folder / File | Description
--------------|------------
Asset | Assets used for the application, e.g. Images
components | These are the React components which are used in the pages for the web application
contexts | This is where the React-wide context is established for common states to be shared across the entire application, e.g. Themes, logged in status
providers | Used alongside the contexts, this is the React provider for the contexts
scenes | The folder containing the skeleton page structure which houses the different React components
services | The different service functions used across the web application
utils | The utility functions used in the web application
routes.js | The different routes that are used in the web application
theme.js | The Material-UI theme of the application
index.js | The entrypoint file for the web application

### Server-side application

The server-side application utilises ExpressJS as the primary framework, and is written mostly in Typescript. The database of choice for the project is MongoDB, and was hosted on a MongoDB Atlas cluster.

Navigate to the ```backend``` folder located in the root folder of the project. Once in this folder, this is the root folder for the backend application.

Install the project dependencies using:
`npm install`
In the project directory, you can run:
Command | Description
--------|------------
npx ts-node app.ts | Runs the server on port 3001 (Current defaults to this, can change this in the code)

The bulk of the code can be found inside the ```backend/source_codes``` folder.

Folder / File | Description
--------------|------------
controllers | This is where the code for the "Controllers" of the Model-View-Controller reside. Each sub-folder consists of code relating to the router.
firebaseConfig | This is where the code relating to firebase wrapper functions resides.
conf.ts | This is where code relating to the firebase configuration for the admin SDK resides, such as the URIs of the relevant connections. Note that changes would need to be made here for your own Firebase deployment purposes.
middleware | This is where the middleware, such as common authentication and validation are written
models | This is where the data model and business logic and interaction with the database takes place. Definitions for the different available data types used and their meanings can be found in the comments within the ```backend/source_codes/models/data/index.ts``` file.
routers | This is where the routing for the different paths and APIs are written
authentication.ts | This is where the firebase-related authentication is written
cache.ts | This is where the server-side cache logic is written
fcm_utility.ts | This is where the logic for the utility functions for the Firebase Cloud Messaging is written

In the root folder, the Dockerfile is also stored here which consists of the commands for establishing the order and types of build steps for the container.

### Mobile application

The mobile application's code can be found in the ```mobile``` folder, with a more specific README for it in the folder.

