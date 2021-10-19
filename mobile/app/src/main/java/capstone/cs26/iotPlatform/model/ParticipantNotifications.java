package capstone.cs26.iotPlatform.model;

import android.content.Context;

import androidx.annotation.NonNull;
import androidx.room.Entity;
import androidx.room.PrimaryKey;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;

import capstone.cs26.iotPlatform.db.AppDatabase;
import capstone.cs26.iotPlatform.service.MyFirebaseMessagingService;

@Entity(tableName = ParticipantNotifications.TABLE_NAME)
public class ParticipantNotifications {
    public static final String TABLE_NAME = "ParticipantNotifications";
    public static final String COLUMN_PK = "participantId";
    @NonNull
    @PrimaryKey
    public String participantId;
    public Integer constantConf;
    public ArrayList<UnhandedInvitation> unhandledInvitations = new ArrayList<>();
    public ArrayList<String> inSendingOrDroppedInvitations = new ArrayList<>();
    public ArrayList<RetrieveDataNotification> retrieveDataNotifications = new ArrayList<>();
    public HashMap<String, HashMap<String, String>> prjDetails = new HashMap<>();

    public ArrayList<Notification> getNotifications() {
        ArrayList<Notification> ret = new ArrayList<>();
        if (unhandledInvitations != null) {
            for (UnhandedInvitation invitation : unhandledInvitations
            ) {
                Date sentTime = null;
                try {
                    sentTime = (new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ")).parse(invitation.invitedTime.replaceAll("Z$",
                            "+0000"));
                } catch (ParseException e) {
                    e.printStackTrace();
                }
                Notification notification = new Notification(sentTime, "UnhandedInvitation", invitation);
                ret.add(notification);
            }
        }
        if (retrieveDataNotifications != null) {
            for (RetrieveDataNotification retrieveDataNotification : retrieveDataNotifications) {
                if (retrieveDataNotification.hasBeenRead) continue;
                Notification notification = new Notification(retrieveDataNotification.retrieveTime, "RetrieveDataNotification", retrieveDataNotification);
                ret.add(notification);
            }
        }
        Collections.sort(ret, (Notification n1, Notification n2) -> {
            Date date1 = n1.sentTime;
            Date date2 = n2.sentTime;
            if (date1 != null && date2 != null) {
                if (date1.getTime() > date2.getTime()) return -1;
                return 1;
            }
            return 1;
        });
        return ret;
    }

    public static class UnhandedInvitation {
        public String projectId;
        public String invitedTime;
        public String receivedTime;
    }

    public void handle(Context context) {
        AppDatabase.databaseWriteExecutor.execute(() -> {
            AppDatabase.getInstance(context).participantNotificationsDao().upsert(this);
        });
        if (inSendingOrDroppedInvitations != null) {
            if (!inSendingOrDroppedInvitations.isEmpty()) {
                for (int i = 0; i < inSendingOrDroppedInvitations.size(); ++i) {
                    String projectId = inSendingOrDroppedInvitations.get(i);
                    MyFirebaseMessagingService.InvitationCommand newInvitationCommand = new MyFirebaseMessagingService.InvitationCommand();
                    newInvitationCommand.projectId = projectId;
                    newInvitationCommand.handle(context, null, null);
                }
            }
        }
    }
}
