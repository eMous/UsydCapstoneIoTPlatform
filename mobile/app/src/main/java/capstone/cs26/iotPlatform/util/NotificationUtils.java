package capstone.cs26.iotPlatform.util;

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

import androidx.core.app.NotificationCompat;

import java.util.Random;

import capstone.cs26.iotPlatform.R;

public class NotificationUtils {
    public static int id = 0;
    public static final String channelId = "IoTPlatForm_Notification";

    public static void sendNotification(Context context, Class<?> clazz, String messageTitle, String messageBody,
                                        Bundle bundle) {
        Intent intent = new Intent(context, clazz);
        intent.putExtras(bundle);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, new Random().nextInt() /* Request code */, intent,
                PendingIntent.FLAG_UPDATE_CURRENT);

        Uri defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
        NotificationCompat.Builder notificationBuilder =
                new NotificationCompat.Builder(context, channelId)
                        .setSmallIcon(R.drawable.common_google_signin_btn_icon_dark)//(R.drawable.ic_stat_ic_notification)
                        .setContentTitle(messageTitle)//getString(R.string.fcm_message))
                        .setContentText(messageBody)
                        .setPriority(Notification.PRIORITY_HIGH)
                        .setVibrate(new long[0])
                        .setAutoCancel(true)
                        .setSound(defaultSoundUri)
                        .setContentIntent(pendingIntent);

        NotificationManager notificationManager =
                (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

        // Since android Oreo notification channel is needed.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(channelId,
                    "Channel human readable title",
                    NotificationManager.IMPORTANCE_HIGH);
            notificationManager.createNotificationChannel(channel);
        }
        if (id == 9999) {
            id++;
        }
        notificationManager.notify(id++ /* ID of notification */, notificationBuilder.build());
    }
}
