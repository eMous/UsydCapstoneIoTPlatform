// Firebase Authentication Client (Front-end Simulation)
import { firebase } from "../conf";

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
const { fAdmin } = require("../conf");
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

// Used to server-testing register a user
export async function register(email, password) {
  const { user } = await cliRegister(email, password);
  return user;
}
