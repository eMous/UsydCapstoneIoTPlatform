export {};
import express = require("express");
const rootRouter = express.Router();
import PubResourceController = require("../../../../controllers/ProjectOwner/PublicResources");

rootRouter.get("/researchFields", PubResourceController.retrieveResourceFields);
rootRouter.get("/sensorNames", PubResourceController.retrieveSensors);
rootRouter.get("/sensorTypes", PubResourceController.retrieveSensorTypes);
rootRouter.get("/apiLevels", PubResourceController.retrieveApiLevels);
rootRouter.get("/deviceModels", PubResourceController.retrieveDeviceModels);
rootRouter.get("/genderTypes", PubResourceController.retrieveGenderTypes);
rootRouter.get(
  "/sensorFrequencies",
  PubResourceController.retrieveSensorFrequencies
);

module.exports = rootRouter;
