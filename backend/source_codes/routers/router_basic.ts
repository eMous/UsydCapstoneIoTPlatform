import { validationResult } from "express-validator";
import cache from "../cache";
import { v4 as uuidv4 } from "uuid";

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

export function purifyFromTemplate(
  template: Object,
  targetToPurify: Object,
  ...ignores
) {
  const properties = Object.getOwnPropertyNames(targetToPurify);
  properties.forEach((element) => {
    if (!(element in template)) {
      if (ignores != undefined) {
        if (!ignores.includes(element)) {
          // console.log(`property ${element} deleted. It's value is ${targetToPurify[element]}`);
          delete targetToPurify[element];
        }
      }
    }
  });
}
