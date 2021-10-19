export {};
const express = require("express");
const rootRouter = express.Router();
const ErrorController = require("../../controllers/Error");

rootRouter.get("/", ErrorController.log);

module.exports = rootRouter;
