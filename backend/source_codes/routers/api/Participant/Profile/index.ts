const express = require("express");
const rootRouter = express.Router();
import { body, oneOf } from "express-validator";
import {
  validatorErrorMiddleware,
  AuthMiddleware,
} from "../../../../middleware";
const ProfileController = require("../../../../controllers/Participant/Profile");
import { GenderPrjRequirement } from "../../../../models/data";

// For CREATING the participant's PROFILE (DIFFERENT FROM ACCOUNT)
rootRouter.post(
  "/",
  AuthMiddleware,
  oneOf([
    [
      body("gender").notEmpty().isInt({
        min: GenderPrjRequirement.getAllGenderValues()[0],
        max: GenderPrjRequirement.getAllGenderValues().length,
      }),
    ],
    [body("name").notEmpty()],
    [body("deviceModel").notEmpty()],
    [body("androidAPI").notEmpty()],
    [body("mobileSystem").notEmpty()],
    [body("mobileDeviceType").notEmpty()],
    [body("sensorConfsTemplate")],
  ]),
  validatorErrorMiddleware,
  ProfileController.createProfile
);

rootRouter.get("/", AuthMiddleware, ProfileController.retrieveProfile);

rootRouter.get(
  "/participantNotifications",
  AuthMiddleware,
  ProfileController.retrieveNotifications
);

rootRouter.post(
  "/location",
  AuthMiddleware,
  body("lat").notEmpty(),
  body("lon").notEmpty(),
  validatorErrorMiddleware,
  ProfileController.updateLocation
);

module.exports = rootRouter;
