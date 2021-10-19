const express = require("express");
const rootRouter = express.Router();
const AuthController = require("../../../../../source_codes/controllers/ProjectOwner/Authentication/index");
import { body, oneOf } from "express-validator";
import { AuthMiddleware } from "../../../../middleware";
import {
  validatorErrorMiddleware,
  purifyFromTemplate,
} from "../../../router_basic";

// The login route
rootRouter.post(
  "/login",
  oneOf([
    // Testing use only
    [body(["password"]).exists().bail(), body("email").isEmail()],
    [body("idToken").exists().bail()],
  ]),
  validatorErrorMiddleware,
  AuthController.login
);

// The logout route
rootRouter.post("/logout", AuthMiddleware, AuthController.logout);

// FOR TESTING USE ONLY (The register route)
rootRouter.post(
  "/register",
  body(["email", "password"]),
  body("email").isEmail(),
  validatorErrorMiddleware,
  AuthController.register
);

module.exports = rootRouter;
