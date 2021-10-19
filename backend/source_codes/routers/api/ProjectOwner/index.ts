export {};
const express = require("express");
const rootRouter = express.Router();
const projectOwnerAuth = require("./Authentication");
const projectOwnerProfile = require("./Profile");
const projectOwnerProject = require("./Project");
const publicResources = require("./PublicResources");

rootRouter.use("/auth", projectOwnerAuth);
rootRouter.use("/publicResources", publicResources);
rootRouter.use("/profile", projectOwnerProfile);
rootRouter.use("/project", projectOwnerProject);

module.exports = rootRouter;
