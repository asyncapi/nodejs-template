# Streetlights MQTT API

The Smartylighting Streetlights API allows you to remotely manage the city lights.

### Check out its awesome features:

* Turn a specific streetlight on/off 🌃
* Dim a specific streetlight 😎
* Receive real-time information about environmental lighting conditions 📈


## Running the server

1. Install dependencies
    ```sh
    npm i
    ```
1. Start the server with default configuration
    ```sh
    npm start
    ```
1. (Optional) Start server with secure production configuration
    ```sh
    NODE_ENV=production npm start
    ```

> NODE_ENV=production relates to `config/common.yml` that contains different configurations for different environments. Starting server without `NODE_ENV` applies default configuration while starting the server as `NODE_ENV=production npm start` applies default configuration supplemented by configuration settings called `production`.