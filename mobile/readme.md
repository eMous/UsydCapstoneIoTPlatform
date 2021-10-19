

## Deployement 

### Configure Firebase Service

Because the FCM and Firebase service currently (2021-07-05) are provided by the team member personally. They might be revoked after the whole project handover. 

You can configure your own Firebase project to the Android application to use the `Firebase Authentication` and the `Firebase Cloud Messaging`. 

You need to:

1. Follow the guide of `console.firebase.google.com` to create a new project. (If you already have one, please ignore this step). You may need to input the Android project information (like package name) according to the existing project, or make some change to the project to fit what you input for the firebase project.
2. Click the Android icon(`Add Firebase to your Android app`), and get the new `google-service.json`.
3. Put your new `google-service.json` to `app`directory and overwrite the existing invalid `google-service.json`
4. Refill the content from the `google-service.json` into the `firebase.properties` accordingly.

### Ready-to-use APK file

A ready-to-use APK file has been put to the `app/release`directory.

### Manually Deploy

You may refer to the **Configure Firebase Service** step to reset the service, and rebuild the APK file by yourself due to the reason mentioned above.

You can do it with the Android application source code in the repository. It is worth mentioning that if you want to sign the new application with the existing key, the key is `androidkey.jks` , the `Key stored passord` is `000000`, the `Key alias` is `key0` and the `Key password`. is `000000` 

Then you can easily use the traditional process to build the APK in the Android Studio: 

Build -> Generate Signed Bundle / APK -> APK -> Input `Key store path`,`Key store password`, `Key alias`,`Key password`-> Next -> Choose your desired `Build Variants`,`Destination Folader`and `Signature Versions`-> Finish.

## Tips

1. Server Adress can be set in the file `app/src/main/java/capstone/cs26/iotPlatform/http/URLs.java`
2. You can flexibily change the server address in the runtime by clicking the title "Login"  in the `Login Activity` 7 times.
3. If the plain HTTP protocol is used, you may need to add your IP or domain name in the `app/src/main/res/xml/network_security_config.xml`
4. You can control the sensor data updating frequency by writing the `sendSensorPackageToServer` method in `MasterService.java`.

3. Put your new `google-service.json` to `beap`directory and overwrite the existing invalid `google-service.json`
