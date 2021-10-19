import cache from "./cache";
import { fAdmin } from "./conf";
import * as models from "./models/data";
const fcm = fAdmin.messaging();
const mongoDb = cache.mongoDb;
class FCMTool {
  private async rawSendMessage(fcmProtocol: models.FCMProtocol) {
    try {
      return await fcm.send(fcmProtocol as unknown as fAdmin.messaging.Message);
    } catch (err) {
      console.error(`FCM send message error: ${err["errorInfo"]["code"]}`);
      return err;
    }
  }

  public async rawSendNotification(
    fcmToken: string,
    title: string,
    content: string,
    customizedData?: models.FCMCutomizedData
  ) {
    const fcmProtocol = new models.FCMProtocol();
    fcmProtocol.data.notificationContent = content;
    fcmProtocol.data.notificationTitle = title;
    const dataJSON = JSON.stringify(customizedData);
    fcmProtocol.data.customizedJsonData = dataJSON ? dataJSON : "";

    fcmProtocol.token = fcmToken;
    fcmProtocol.android.priority = "high";
    return await this.rawSendMessage(fcmProtocol);
  }

  /**
   * This function will mark all other instance of users as logged out, with the exception of the user indicated that should stay logged in
   * @param userToStayLoggedIn The email address of the user to stay logged in, all others with the same FCM token will be considered logged out
   * @param fcmToken The FCM token of the user who should stay logged in
   */
  public async flagOtherUsersAsLoggedOut(
    userToStayLoggedIn: string,
    fcmToken: string,
  ) {
    const fcmUserCollection = mongoDb.collection(models.FCMUser.name);
    await fcmUserCollection.updateMany(
      { email: userToStayLoggedIn, fcmToken: { $ne: fcmToken } },
      { $set: { currentLoggedIn: false } }
    );
  }

  public async updateUser(
    userEmail: string,
    fcmToken: string,
    currentLoggedIn: boolean
  ) {
    // TODO: Check later if we need a lock
    const nowDate = new Date();
    const fcmUserCollection = mongoDb.collection(models.FCMUser.name);
    const toSet = {};

    toSet["currentLoggedIn"] = currentLoggedIn;
    if (currentLoggedIn) {
      toSet["lastLoginTime"] = nowDate;
    }
    const fcmUser = (await fcmUserCollection.findOne({
      email: userEmail,
      fcmToken: fcmToken,
    })) as models.FCMUser;
    toSet["isFirstSession"] = !fcmUser;
    let reslt = await fcmUserCollection.findOneAndUpdate(
      { email: userEmail, fcmToken: fcmToken },
      { $set: toSet },
      { upsert: true, returnOriginal: false }
    );
    return reslt.value;
  }

  public async sendNotificationToUser(
    userEmail: string,
    title: string,
    content: string,
    data?: models.FCMCutomizedData
  ) {
    const fcmUserCollection = mongoDb.collection(models.FCMUser.name);
    const fcmUser = (await fcmUserCollection.findOne(
      { email: userEmail, currentLoggedIn: true },
      { sort: { lastLoginTime: -1 } }
    )) as models.FCMUser;
    if (!fcmUser) {
      console.error(
        `User ${userEmail} doesn't have a registered FCMToken or not logged in.`
      );
      return;
    }
    const result = await this.rawSendNotification(
      fcmUser.fcmToken,
      title,
      content,
      data
    );
    if (result instanceof Error) {
      result["fcmToken"] = fcmUser.fcmToken;
    }
    return result;
  }

  public async userIsLoggedIn(email: string): Promise<boolean> {
    const fcmUserCollection = mongoDb.collection(models.FCMUser.name);
    const fcmUser = (await fcmUserCollection.findOne(
      { email: email, currentLoggedIn: true },
      { sort: { lastLoginTime: -1 } }
    )) as models.FCMUser;
    return fcmUser ? true : false;
  }
}

export const fcmTool = new FCMTool();
