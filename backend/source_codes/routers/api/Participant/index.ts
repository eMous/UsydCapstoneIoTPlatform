export {};
const express = require("express");
const rootRouter = express.Router();
const participantAuth = require("./Authentication");
const participantProfile = require("./Profile");
const participantProject = require("./Project");

rootRouter.use("/auth", participantAuth);
rootRouter.use("/profile", participantProfile);
rootRouter.use("/project", participantProject);

module.exports = rootRouter;
