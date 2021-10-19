const { fAdmin } = require("../conf");
import { validationResult } from "express-validator";

export const validatorErrorMiddleware = (req, res, next) => {
  const err = validationResult(req) as any;
  // console.log(err)
  if (!err.isEmpty()) {
    var fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
    console.error(
      req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      req.body,
      fullUrl
    );
    err.statusCode = 400;
    err.message = "";
    if (err.errors.length > 0) {
      err.message = err.errors[0].msg;
    }
    err.message +=
      "\
      (Please check errors property for more information.)";
    return next(err);
  }
  next();
};

export const AuthMiddleware = async (req, res, next) => {
  var fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
  if (
    (!req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer ")) &&
    !(req.cookies && req.cookies.__session)
  ) {
    console.error(
      req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      fullUrl,
      "No Firebase ID token was passed as a Bearer token in the Authorization header.",
      "Make sure you authorize your request by providing the following HTTP header:",
      "Authorization: Bearer <Firebase ID Token>",
      'or by passing a "__session" cookie.'
    );
    res.status(403).send("Unauthorized");
    return;
  }

  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    console.log('Found "Authorization" header');
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else if (req.cookies) {
    // console.log('Found "__session" cookie');
    // Read the ID Token from cookie.
    idToken = req.cookies.__session;
  } else {
    // No cookie
    res.status(403).send("Unauthorized");
    return;
  }

  try {
    const decodedIdToken = await fAdmin.auth().verifyIdToken(idToken);
    req.user = decodedIdToken;
    next();
    return;
  } catch (error) {
    console.error("Error while verifying Firebase ID token:", error);
    res.status(403).send("Unauthorized");
    return;
  }
};
