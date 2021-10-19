const express = require("express");
const rootRouter = express.Router();
import { body, oneOf } from "express-validator";
import cache from "../../../../cache";
import {
  validatorErrorMiddleware,
  AuthMiddleware,
} from "../../../../middleware";
const ProfileController = require("../../../../controllers/ProjectOwner/Profile");

// To create a profile for the Project Owner (Register)
rootRouter.post(
  "/",
  AuthMiddleware,
  oneOf([
    [body("organisation").notEmpty()],
    [body("name").notEmpty()],
    [body("phoneNum").notEmpty().isMobilePhone("any")],
    [body("imageBase64").notEmpty().isBase64()],
    [
      body("researchFields").isArray(),
      body("researchFields.*", "The reseachField doesn't exist.").custom(
        (value: number, { req }) => {
          return value in cache.getResearchFields();
        }
      ),
    ],
  ]),
  validatorErrorMiddleware,
  ProfileController.createProfile
);

// To create a profile for the Project Owner (ONLY FOR TESTING PURPOSES)
rootRouter.post(
  "/register",
  body(["email", "password"]),
  body("email").isEmail(),
  validatorErrorMiddleware,
  ProfileController.createProfileDevMode
);

// To retrieve a profile for the Project Owner
rootRouter.get("/", AuthMiddleware, ProfileController.retrieveProfile);

// To add to the Project Owner's fund balance
rootRouter.post(
  "/addBalance",
  AuthMiddleware,
  [
    body("addValue", "Number must be larger than 0 and less than 9999").isFloat(
      { gt: 0, lt: 9999 }
    ),
  ],
  validatorErrorMiddleware,
  ProfileController.addToBalance
);

module.exports = rootRouter;
