// Firebase Authentication Client (Front-end Simulation)
import { firebase } from "./conf";

let cliAuth = firebase.auth();
// Register
async function cliRegister(email, password) {
  const userCredential = await cliAuth.createUserWithEmailAndPassword(
    email,
    password
  );
  console.log(`email of ${email} has been successfully registered & login!`);
  await userCredential.user.sendEmailVerification();
  console.log(
    `email of ${email} has been sent an email message to verify its email!`
  );
  return userCredential;
}
// Login
async function cliLogin(email, password) {
  const userCredential = await cliAuth.signInWithEmailAndPassword(
    email,
    password
  );
  console.log(`email of ${email} has been successfully logined!`);
  const isEmailVerified = userCredential.user.emailVerified;
  return userCredential;
}
// Resend Email Verification
async function cliSendEmailVerification(email) {
  let ret = {};

  // const userCredential = await cliAuth.signInWithEmailAndPassword(email, password);
  // console.log(`email of ${email} has been successfully logined!`);
  // const isEmailVerified = userCredential.user.emailVerified;
  // ret.isEmailVerified = isEmailVerified;
  return ret;
}

// Firebase Authentication Server(Admin)
const { fAdmin } = require("./conf");
// Authentication
export async function authByPassword(email, password) {
  const { user } = await cliLogin(email, password);
  const idToken = await user.getIdToken();
  return idToken;
}
export async function authByIdToken(idToken) {
  return await fAdmin.auth().verifyIdToken(idToken);
}
export async function idTokenToEmail(idToken) {}
// Authentication middleware
export async function middleware(req, res, next) {
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
}
// Used to server-testing register a user
export async function register(email, password) {
  const { user } = await cliRegister(email, password);
  return user;
}
