import {
  authByPassword,
  authByIdToken,
  register,
} from "../../../firebaseConfig";
import * as models from "../../../models/data";

module.exports.login = async (req, res, next) => {
  let idToken;
  try {
    if (req.body.email && req.body.password) {
      idToken = await authByPassword(req.body.email, req.body.password);
    } else {
      idToken = req.body.idToken;
    }
    res.cookie("__session", idToken, { maxAge: 3500 * 1000, httpOnly: true });
    res.json(new models.Success(true));
  } catch (err) {
    err.statusCode = 400;
    next(err);
    return;
  }
};

module.exports.logout = (req, res, next) => {
  try {
    res.cookie("__session", null, { maxAge: 0, httpOnly: true });
    res.sendStatus(200);
  } catch (error) {
    next(error);
    return;
  }
};

module.exports.register = async (req, res, next) => {
  try {
    await register(req.body.email, req.body.password);
    res.sendStatus(200);
  } catch (err) {
    return res.status(400).send(err);
  }
};
