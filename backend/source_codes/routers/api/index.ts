export {};
const express = require("express");
const rootRouter = express.Router();
const projectOwner = require("./ProjectOwner");
const participant = require("./Participant");

rootRouter.use("/projectowner", projectOwner);
rootRouter.use("/participant", participant);

module.exports = rootRouter;
