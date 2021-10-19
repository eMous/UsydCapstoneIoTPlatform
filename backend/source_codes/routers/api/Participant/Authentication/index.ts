const express = require("express");
const rootRouter = express.Router();
import { body } from "express-validator";
import {
  AuthMiddleware,
  validatorErrorMiddleware,
} from "../../../../middleware";
const AuthController = require("../../../../controllers/Participant/Authentication");

// For logging the participant in
rootRouter.post(
  "/login",
  AuthMiddleware,
  body("fcmToken").isString().notEmpty(),
  body("sensors").notEmpty(),
  validatorErrorMiddleware,
  AuthController.login
);

// For logging the participant out
rootRouter.post(
  "/logout",
  AuthMiddleware,
  body("fcmToken").isString().notEmpty(),
  AuthController.logout
);

// For creating a new Participant ACCOUNT (DIFFERENT FROM PROFILE)
rootRouter.post(
  "/register",
  AuthMiddleware,
  body(["email", "password"]),
  body("email").isEmail(),
  validatorErrorMiddleware,
  AuthController.register
);

module.exports = rootRouter;
