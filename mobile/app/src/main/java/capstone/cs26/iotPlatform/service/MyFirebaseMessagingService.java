package capstone.cs26.iotPlatform.service;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.google.gson.Gson;

import java.util.ArrayList;
import java.util.Map;

import capstone.cs26.iotPlatform.R;
import capstone.cs26.iotPlatform.activity.MainActivity;
import capstone.cs26.iotPlatform.db.AppDatabase;
import capstone.cs26.iotPlatform.http.HttpUtil;
import capstone.cs26.iotPlatform.http.URLs;
import capstone.cs26.iotPlatform.model.InvitationGotRequestModel;
import capstone.cs26.iotPlatform.model.ParticipantNotifications;
import capstone.cs26.iotPlatform.model.ParticipantProfile;
import capstone.cs26.iotPlatform.model.ProjectDetailRequestModel;
import capstone.cs26.iotPlatform.util.NotificationUtils;

//import com.google.firebase.quickstart.fcm.R;

/**
 * NOTE: There can only be one service in each app that receives FCM messages. If multiple
 * are declared in the Manifest then the first one will be chosen.
 * <p>
 * In order to make this Java sample functional, you must remove the following from the Kotlin messaging
 * service in the AndroidManifest.xml:
 * <p>
 * <intent-filter>
 * <action android:name="com.google.firebase.MESSAGING_EVENT" />
 * </intent-filter>
 */
public class MyFirebaseMessagingService extends FirebaseMessagingService {

    private static final String TAG = "MyFirebaseMsgService";
    private static MyFirebaseMessagingService instance = null;

    public static MyFirebaseMessagingService getInstance() {
        return instance;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        instance = this;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        System.out.println("Destroy");
    }

    /**
     * Called when message is received.
     *
     * @param remoteMessage Object representing the message received from Firebase Cloud Messaging.
     */
    // [START receive_message]
    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        // [START_EXCLUDE]
        // There are two types of messages data messages and notification messages. Data messages
        // are handled
        // here in onMessageReceived whether the app is in the foreground or background. Data
        // messages are the type
        // traditionally used with GCM. Notification messages are only received here in
        // onMessageReceived when the app
        // is in the foreground. When the app is in the background an automatically generated
        // notification is displayed.
        // When the user taps on the notification they are returned to the app. Messages
        // containing both notification
        // and data payloads are treated as notification messages. The Firebase console always
        // sends notification
        // messages. For more see: https://firebase.google.com/docs/cloud-messaging/concept-options
        // [END_EXCLUDE]

        // TODO(developer): Handle FCM messages here.
        // Not getting messages here? See why this may be: https://goo.gl/39bRNJ
        Log.e(TAG, "From: " + remoteMessage.getFrom());

        Map<String, String> data = remoteMessage.getData();
        if (data.containsKey(FCMCustomizedProtocol.CUSTOMIZED_JSON_DATA)) {
            String customizedJson = data.get(FCMCustomizedProtocol.CUSTOMIZED_JSON_DATA);
            if (!customizedJson.isEmpty()) {
                FCMCustomizedProtocol protocol = new Gson().fromJson(customizedJson, FCMCustomizedProtocol.class);
                protocol.analyse(this, protocol.showNotification, remoteMessage.getData().get("notificationTitle"), remoteMessage.getData().get(
                        "notificationContent"));
//                if (protocol.showNotification) {
//                    if (remoteMessage.getData().containsKey("notificationContent") && remoteMessage.getData().containsKey(
//                            "notificationTitle")) {
//                        Log.e(TAG, remoteMessage.getData().toString());
//                        sendNotification(remoteMessage.getData().get("notificationTitle"), remoteMessage.getData().get(
//                                "notificationContent"));
//                    }
//                }
            } else {
                if (remoteMessage.getData().containsKey("notificationContent") && remoteMessage.getData().containsKey(
                        "notificationTitle")) {
                    Log.e(TAG, remoteMessage.getData().toString());
                    sendNotification(remoteMessage.getData().get("notificationTitle"), remoteMessage.getData().get(
                            "notificationContent"));
                }
            }

        }
    }
    // [END receive_message]


    // [START on_new_token]

    /**
     * There are two scenarios when onNewToken is called:
     * 1) When a new token is generated on initial app startup
     * 2) Whenever an existing token is changed
     * Under #2, there are three scenarios when the existing token is changed:
     * A) App is restored to a new device
     * B) User uninstalls/reinstalls the app
     * C) User clears app data
     */
    @Override
    public void onNewToken(String token) {
        Log.d(TAG, "Refreshed token: " + token);

        // If you want to send messages to this application instance or
        // manage this apps subscriptions on the server side, send the
        // FCM registration token to your app server.
        sendRegistrationToServer(token);
    }
    // [END on_new_token]

    /**
     * Schedule async work using WorkManager.
     */
    private void scheduleJob() {
        // [START dispatch_job]
        System.out.println("To do");
//        OneTimeWorkRequest work = new OneTimeWorkRequest.Builder(MyWorker.class)
//                .build();
//        WorkManager.getInstance().beginWith(work).enqueue();
        // [END dispatch_job]
    }

    /**
     * Handle time allotted to BroadcastReceivers.
     */
    private void handleNow() {
        Log.d(TAG, "Short lived task is done.");
    }

    /**
     * Persist token to third-party servers.
     * <p>
     * Modify this method to associate the user's FCM registration token with any
     * server-side account maintained by your application.
     *
     * @param token The new token.
     */
    private void sendRegistrationToServer(String token) {
        // TODO: Implement this method to send token to your app server.
    }

    /**
     * Create and show a simple notification containing the received FCM message.
     *
     * @param messageBody FCM message body received.
     */
//    private void sendNotification(String messageTitle, String messageBody,
//                                  Map<String, String> data) {
//    // https://firebase.google.com/docs/cloud-messaging/android/receive
//        // https://stackoverflow.com/questions/37358462/firebase-onmessagereceived-not-called-when-app-in-background
//        Intent intent = new Intent(this, LoginActivity.class);
//
//        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0 /* Request code */, intent,
//                PendingIntent.FLAG_ONE_SHOT);
//
//        NotificationCompat.Builder mBuilder = new NotificationCompat.Builder(this, "channel id")
//                .setSmallIcon(R.drawable.ic_notifications_black_24dp)
//                .setContentTitle(messageTitle)
//                .setContentText(messageBody)
//                .setContentIntent(pendingIntent)
//
//                .setDefaults(DEFAULT_SOUND | DEFAULT_VIBRATE) //Important for heads-up notification
//                .setPriority(Notification.PRIORITY_MAX); //Important for heads-up notification
//
//        Notification buildNotification = mBuilder.build();
//        int notifyId = (int) System.currentTimeMillis(); //For each push the older one will not be replaced for this unique id
//
//        // Since android Oreo notification channel is needed.
//        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
//            String name = "channel name";
//            String description = "channel description";
//            int importance = NotificationManager.IMPORTANCE_HIGH; //Important for heads-up notification
//            NotificationChannel channel = new NotificationChannel("channel id",
//                    name,
//                    importance);
//            channel.setDescription(description);
//            channel.setShowBadge(true);
//            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
//            NotificationManager notificationManager = getSystemService(NotificationManager.class);
//
//            if (notificationManager != null) {
//                notificationManager.createNotificationChannel(channel);
//                notificationManager.notify(notifyId, buildNotification);
//            }
//        }else{
//
//            NotificationManager mNotifyMgr = (NotificationManager)getSystemService(NOTIFICATION_SERVICE);
//            if (mNotifyMgr != null) {
//                mNotifyMgr.notify(notifyId, buildNotification);
//            }
//        }
//    }
    private void sendNotification(String messageTitle, String messageBody) {
        Intent intent = new Intent(this, MainActivity.class);
        intent.putExtra("goto", R.id.new_nav_notifications);
//        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0 /* Request code */, intent,
                PendingIntent.FLAG_ONE_SHOT);

        String channelId = "channelId";//getString(R.string.default_notification_channel_id);
        Uri defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
        NotificationCompat.Builder notificationBuilder =
                new NotificationCompat.Builder(this, channelId)
                        .setSmallIcon(R.drawable.common_google_signin_btn_icon_dark)//(R.drawable.ic_stat_ic_notification)
                        .setContentTitle(messageTitle)//getString(R.string.fcm_message))
                        .setContentText(messageBody)
                        .setPriority(Notification.PRIORITY_HIGH)
                        .setVibrate(new long[0])
                        .setAutoCancel(true)
                        .setSound(defaultSoundUri)
                        .setContentIntent(pendingIntent);

        NotificationManager notificationManager =
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);

        // Since android Oreo notification channel is needed.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(channelId,
                    "Channel human readable title",
                    NotificationManager.IMPORTANCE_HIGH);
            notificationManager.createNotificationChannel(channel);
        }

        notificationManager.notify(0 /* ID of notification */, notificationBuilder.build());
    }

    class FCMCustomizedProtocol {
        static final String CUSTOMIZED_JSON_DATA = "customizedJsonData";
        static final String COMMAND_IDENTIFIER_KEY = "commandId";
        static final String COMMAND_DATA_KEY = "commandData";
        static final int INVITATION_COMMAND = 1;
        static final int PARTICIPANT_DATA_COMMAND = 2;
        static final int DATA_RETRIEVED_COMMAND = 3;
        Boolean showNotification;
        Integer commandId;
        Map commandData;

        void analyse(Context context, boolean showNotification, String title, String content) {
            Gson gson = new Gson();
            switch (commandId.intValue()) {
                case INVITATION_COMMAND:
                    InvitationCommand invitationCommand = gson.fromJson(gson.toJson(commandData),
                            InvitationCommand.class);
                    invitationCommand.handle(context, title, content);
                    break;
                case PARTICIPANT_DATA_COMMAND:
                    ParticipantData participantData = gson.fromJson(gson.toJson(commandData),
                            ParticipantData.class);
                    participantData.handle();
                    break;
                case DATA_RETRIEVED_COMMAND:
                    DataRetrieveCommand dataRetrieveCommand = gson.fromJson(gson.toJson(commandData), DataRetrieveCommand.class);
                    dataRetrieveCommand.handle(context, title, content);
                default:
                    break;
            }
        }
    }

    public static class DataRetrieveCommand {
        public String retrieveId;

        public void handle(Context context, String title, String content) {

            HttpUtil.get(URLs.GetParticipantNotificationsUrl(), new Object(), ParticipantNotifications.class,
                    participantNotifications -> {
                        participantNotifications.handle(MyFirebaseMessagingService.getInstance());
                    }, MyFirebaseMessagingService.getInstance());


            if (title != null && content != null) {
                Bundle bundle = new Bundle();
                bundle.putString("command", "retrieveData");
                NotificationUtils.sendNotification(context, MainActivity.class, title, content, bundle);
            }
        }
    }

    public static class InvitationCommand {
        public String projectId;
        String inviteTime;

        public void handle(Context context, String title, String content) {
            Log.e(TAG, "Telling API Server I got the invitation...");
            InvitationGotRequestModel invitationGotRequestModel = new InvitationGotRequestModel(projectId);
            Log.e(TAG, "ready to send Got");


            HttpUtil.post(URLs.GetGotInvitationUrl(), invitationGotRequestModel, ParticipantNotifications.class, response -> {
                Log.e(TAG, "API Server knew I got the invitation of " + projectId + ", now I should render the UI...");
                response.handle(MyFirebaseMessagingService.getInstance());
            }, MyFirebaseMessagingService.getInstance());

            new Handler(Looper.getMainLooper()).postDelayed(() -> {
                (new ProjectDetailRequestModel(projectId)).request(MyFirebaseMessagingService.getInstance());
            }, 500);

            if (title != null && content != null) {
                Bundle bundle = new Bundle();
                bundle.putString("command", "invitation");
                bundle.putString("prjId", projectId);
                new Handler(Looper.getMainLooper()).postDelayed(() -> {
                    NotificationUtils.sendNotification(context, MainActivity.class, title, content, bundle);
                }, 1500);
            }
        }
    }

    class ParticipantData {
        Boolean participantNotifications;
        Boolean participantProfile;
        ArrayList<String> projectIds = new ArrayList<>();

        void handle() {
            if (participantNotifications == true) {
                Log.e(TAG, "PARDATA provides participantNotifications");
                HttpUtil.get(URLs.GetParticipantNotificationsUrl(), new Object(), ParticipantNotifications.class,
                        participantNotifications -> {
                            participantNotifications.handle(MyFirebaseMessagingService.getInstance());
                        }, MyFirebaseMessagingService.getInstance());
            }
            if (participantProfile == true) {
                HttpUtil.get(URLs.GetProfileUrl(), new Object(), ParticipantProfile.class,
                        participantProfile -> {
                            MyFirebaseMessagingService.getInstance().handleParticipantProfile(participantProfile);
                        }, MyFirebaseMessagingService.getInstance());
            }
            if (!projectIds.isEmpty()) {
                for (int i = 0; i < projectIds.size(); ++i) {
                    ProjectDetailRequestModel projectDetailRequestModel =
                            new ProjectDetailRequestModel(projectIds.get(i));
                    projectDetailRequestModel.request(MyFirebaseMessagingService.getInstance());
                }
            }
        }
    }

    public void handleParticipantProfile(ParticipantProfile participantProfile) {
        AppDatabase.databaseWriteExecutor.execute(() -> {
//            Log.e(TAG, "Profile update " + new Gson().toJson(participantProfile));
            AppDatabase.getInstance(MyFirebaseMessagingService.getInstance()).participantProfileDao().upsert(participantProfile);
        });
    }
}