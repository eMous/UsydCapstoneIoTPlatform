const models = require("./models/data");
const NodeCache = require("node-cache");
const { db } = require("../source_codes/conf");
import { v4 as uuidv4 } from "uuid";
import { MongoClient } from "mongodb";
import cache from "./cache";
import { firebase, fAdmin } from "./conf";
import { fcmTool } from "./fcm_utility";
import { matchmakingAndInvite } from "./matchmaking";
// import firebase from "firebase"

async function test() {
  try {
    // const assert = require('assert');
    // var firebaseConfig = {
    //   apiKey: "AIzaSyC17TGPUxc451JkyvWeuXo-3hKJqHXg-78",
    //   authDomain: "iot-platform-test-for-tom.firebaseapp.com",
    //   projectId: "iot-platform-test-for-tom",
    //   storageBucket: "iot-platform-test-for-tom.appspot.com",
    //   messagingSenderId: "435746541973",
    //   appId: "1:435746541973:web:4b6d309227dadd7da2e69c",
    //   measurementId: "G-JH65EEKHPZ"
    // };
    // firebase.initializeApp(firebaseConfig);
    // const auth = firebase.auth();
    // const ret = await auth.signInWithEmailAndPassword("projectowner@gmail.com","123456");

    // const idToken =await auth.currentUser.getIdToken(false);
    // const requestBody = {idToken:idToken};

    // This registration token comes from the client FCM SDKs.
    var registrationToken =
      "dc6F8ICnQ3WoHNnRlcXh80:APA91bFoV7Aso76K94rpiZWvfVJN21JSgH-jCZpZ5lp8aUF1TQVeOf1RmbG0Wd4VLvMgb5HEVxotM2EOzUWkQYNSz262otuRHQzQo-_epydqfyfI7VfV25zdx03EKt4_gAerWEOUlDLo";

    var message = {
      // notification: {

      //   title: "Test notification title",
      //   /**
      //    * The notification body
      //    */
      //   body: "Test notification body" + new Date(),
      //   /**
      //    * URL of an image to be displayed in the notification.
      //    */
      //   imageUrl: "https://lh3.googleusecontent.com/-9QE-1FiuKNo/AAAAAAAAAAI/AAAAAAAAJVE/yvEoT7eXcio/photo.jpg?sz=64"

      // },

      data: {
        notificationTitle: "Test FCM Notifictaion",
        notificationBody: "This is the notification body: " + new Date(),
        score: "850",
        time: "2:45",
      },
      token: registrationToken,
    };
    const MK = { s: 2 };
    delete MK["ss"];
    const k = new Date();
    const ssd = k.getTimezoneOffset();

    // const kk = await fcmTool.addUser("email","fcmToken");
    const n = 1;
    // const kkkk =await cache.mongoGetAllParticipantsCached();
    // await matchmakingAndInvite("f4538d80-015c-47b8-a89c-1301346fb584");
    // Send a message to the device corresponding to the provided
    // registration token.
    // fAdmin.messaging().send(message)
    //   .then((response) => {
    //     // Response is a message ID string.
    //     console.log('Successfully sent message:', response);
    //   })
    //   .catch((error) => {
    //     console.log('Error sending message:', error);
    //   });

    // await addAnError("test");

    // console.log('test finishes!');
  } catch (err) {
    console.error(err);
  }
}

module.exports = test;
