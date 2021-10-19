const express = require("express");
const rootRouter = express.Router();

const api = require("./api");
const error = require("./error");

rootRouter.use("/api", api);
rootRouter.use("/errors", error);

module.exports = rootRouter;
