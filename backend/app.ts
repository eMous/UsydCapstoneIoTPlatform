// Initialize external services
"use strict";
const { default: cache } = require("./source_codes/cache");
import cors from "cors";
const application = async () => {
  const express = require("express");
  const app = express();
  const cookieParser = require("cookie-parser");
  const session = require("express-session");
  app
    .use(
      cors({
        origin: true,
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    )
    .use(express.urlencoded({ extended: true }))
    .use(express.json({ limit: "5mb" }))
    .use(cookieParser())
    .use(
      session({
        resave: false,
        saveUninitialized: false,
        secret: "`bJ&dk5y%yR:%Y4E",
        cookie: { maxAge: 3500 * 1000 },
      })
    );

  // Use the routes defined
  const routes = require("./source_codes/routers/index");
  app.use(routes);

  // Final Execption Catcher
  const finalErrorHandler = async (err, req, res, next) => {
    if (err.code === undefined) {
      err.code = 500;
    }
    const statusCode = err.statusCode ? err.statusCode : 500;
    delete err.statusCode;
    console.error(
      JSON.stringify(err),
      typeof err.errors !== "undefined" ? JSON.stringify(err.errors) : null
    );
    res.status(statusCode).json(err);
  };

  app.use(finalErrorHandler);

  // const port = 8080;
  const port = 3001;

  app.listen(port, () => {
    console.log(`example app listening at http://localhost:${port}`);
  });
};

(async () => {
  try {
    await cache.initDB();
    await cache.clearCache();
    require("./source_codes/prepare");
    await application();
    await require("./source_codes/test")();
  } catch (err) {
    console.error(err);
  }
})();
